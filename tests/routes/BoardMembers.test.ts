import { describe, test, expect, beforeEach, mock } from "bun:test";
import { eq } from "drizzle-orm";
import * as schema from "../../database/schema";
import { createTestDatabase, seedUser, type TestDatabase } from "../helpers/db";
import { makeTestContext, makeFormRequest } from "../helpers/context";

// mock.module() must be called before the dynamic imports below. Both
// factories read `testDb` / `currentUser` lazily, so updating them per test is
// picked up.
let testDb: TestDatabase;
let currentUser: { id: string; role: string | null };

mock.module("~/util/database.server", () => ({
  getDatabase: () => testDb,
}));

mock.module("~/util/authHelpers.server", () => ({
  isAuthenticated: async () => ({ user: currentUser, session: {} }),
}));

const { action, loader } = await import("~/routes/BoardMembers");

const URL = "http://localhost:3000/resident/board";

let admin: ReturnType<typeof seedUser>;
let owner: ReturnType<typeof seedUser>;

beforeEach(() => {
  testDb = createTestDatabase();
  admin = seedUser(testDb, {
    email: "admin@test.com",
    name: "Root Admin",
    role: "admin",
  });
  owner = seedUser(testDb, {
    email: "dana@test.com",
    name: "Dana Whitfield",
    role: "owner",
    unitNumber: 210,
  });
  currentUser = { id: admin.id, role: "admin" };
  testDb
    .insert(schema.boardMembers)
    .values([{ role: "President" }, { role: "Treasurer" }, { role: "Secretary" }])
    .run();
});

function seat(role: string) {
  return testDb
    .select()
    .from(schema.boardMembers)
    .where(eq(schema.boardMembers.role, role))
    .get()!;
}

function roleOf(userId: string) {
  return testDb
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .get()!.role;
}

function changeSeat(role: string, userId: string) {
  return action({
    request: makeFormRequest(URL, {
      intent: "update",
      recordId: String(seat(role).id),
      userId,
    }),
    context: makeTestContext(),
    params: {},
  });
}

describe("loader", () => {
  test("lists each seat with its holder's email and unit", async () => {
    await changeSeat("Treasurer", owner.id);

    const data = await loader({
      request: new Request(URL),
      context: makeTestContext(),
      params: {},
    });

    const treasurer = data.seats.find((s) => s.role === "Treasurer");
    expect(treasurer).toMatchObject({
      name: "Dana Whitfield",
      email: "dana@test.com",
      unitNumber: 210,
    });
    expect(data.seats.find((s) => s.role === "Secretary")?.userId).toBeNull();
  });

  test("only admins get the list of people who could take a seat", async () => {
    const args = {
      request: new Request(URL),
      context: makeTestContext(),
      params: {},
    };
    expect((await loader(args)).candidates.length).toBe(2);

    currentUser = { id: owner.id, role: "owner" };
    expect((await loader(args)).candidates).toEqual([]);
  });
});

describe("changing a seat", () => {
  test("giving someone a seat makes them an admin", async () => {
    const result = await changeSeat("Treasurer", owner.id);

    expect(result).toEqual({
      success: true,
      message: "Dana Whitfield is now the Treasurer.",
    });
    expect(seat("Treasurer").userId).toBe(owner.id);
    expect(roleOf(owner.id)).toBe("admin");
  });

  test("leaving a seat open sends its holder back to being an owner", async () => {
    await changeSeat("Treasurer", owner.id);
    const result = await changeSeat("Treasurer", "");

    expect(result).toMatchObject({ success: true });
    expect(seat("Treasurer").userId).toBeNull();
    expect(roleOf(owner.id)).toBe("owner");
  });

  test("someone already on the board can't take a second seat", async () => {
    await changeSeat("Treasurer", owner.id);
    const result = await changeSeat("Secretary", owner.id);

    expect(result).toMatchObject({ success: false });
    expect(seat("Secretary").userId).toBeNull();
  });

  test("residents who haven't signed in yet can't take a seat", async () => {
    const newcomer = seedUser(testDb, {
      email: "new@test.com",
      emailVerified: false,
    });
    const result = await changeSeat("Secretary", newcomer.id);

    expect(result).toMatchObject({ success: false });
  });

  test("owners can't change the board", async () => {
    currentUser = { id: owner.id, role: "owner" };
    const result = await changeSeat("President", owner.id);

    expect(result).toMatchObject({ success: false });
    expect(seat("President").userId).toBeNull();
  });
});

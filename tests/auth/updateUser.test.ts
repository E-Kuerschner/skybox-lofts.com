import { describe, test, expect, beforeEach, mock } from "bun:test";
import { eq } from "drizzle-orm";
import { createTestDatabase, seedUser, type TestDatabase } from "../helpers/db";
import * as schema from "../../database/schema";

// mock.module() must be called before the dynamic imports below. The factory
// reads `testDb` lazily, so updating it in beforeEach is picked up per test.
let testDb: TestDatabase;

mock.module("~/util/database.server", () => ({
  getDatabase: () => testDb,
}));

const { BASE_URL, authHandler, signIn } = await import("../helpers/auth");

const RESIDENT_EMAIL = "resident@test.com";

/** POST to update-user as the signed-in resident, the way a browser could. */
function updateUser(cookie: string, body: Record<string, unknown>) {
  return authHandler(
    new Request(`${BASE_URL}/api/auth/update-user`, {
      method: "POST",
      headers: {
        Cookie: cookie,
        "Content-Type": "application/json",
        Origin: BASE_URL,
      },
      body: JSON.stringify(body),
    }),
  );
}

function getUser(id: string) {
  return testDb
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .get()!;
}

beforeEach(() => {
  testDb = createTestDatabase();
});

describe("update-user", () => {
  test("a resident cannot change their own unit number or name", async () => {
    const user = seedUser(testDb, {
      email: RESIDENT_EMAIL,
      unitNumber: 4,
      firstName: "Test",
      lastName: "Resident",
    });
    const cookie = await signIn(RESIDENT_EMAIL);

    await updateUser(cookie, { unitNumber: 99, firstName: "Z", lastName: "Y" });

    const after = getUser(user.id);
    expect(after.unitNumber).toBe(4);
    expect(after.firstName).toBe("Test");
    expect(after.lastName).toBe("Resident");
  });

  test("a resident cannot make themselves an admin or lift a ban", async () => {
    const user = seedUser(testDb, { email: RESIDENT_EMAIL, role: "user" });
    const cookie = await signIn(RESIDENT_EMAIL);

    await updateUser(cookie, { role: "admin", banned: true });

    const after = getUser(user.id);
    expect(after.role).toBe("user");
    expect(after.banned).toBeFalsy();
  });

  test("a resident can still change their email preference", async () => {
    const user = seedUser(testDb, {
      email: RESIDENT_EMAIL,
      receivesGeneralEmails: true,
    });
    const cookie = await signIn(RESIDENT_EMAIL);

    const response = await updateUser(cookie, { receivesGeneralEmails: false });

    expect(response.status).toBe(200);
    expect(getUser(user.id).receivesGeneralEmails).toBe(false);
  });
});

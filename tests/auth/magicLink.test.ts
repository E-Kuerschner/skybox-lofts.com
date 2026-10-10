import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  mock,
  setSystemTime,
} from "bun:test";
import { eq } from "drizzle-orm";
import { lastResendRequest } from "../mocks/handlers/resend";
import { createTestDatabase, seedUser, type TestDatabase } from "../helpers/db";
import { makeTestContext } from "../helpers/context";
import * as schema from "../../database/schema";

// mock.module() must be called before the dynamic imports below. The factory
// reads `testDb` lazily, so updating it in beforeEach is picked up per test.
let testDb: TestDatabase;

mock.module("~/util/database.server", () => ({
  getDatabase: () => testDb,
}));

const { getAuth } = await import("~/auth");
const {
  BASE_URL,
  authHandler,
  requestMagicLink,
  clickMagicLink,
  toCookieHeader,
} = await import("../helpers/auth");

const RESIDENT_EMAIL = "resident@test.com";

function getSession(cookie: string) {
  return getAuth(makeTestContext()).api.getSession({
    headers: new Headers({ Cookie: cookie }),
  });
}

function sessionCount() {
  return testDb.select().from(schema.sessions).all().length;
}

beforeEach(() => {
  testDb = createTestDatabase();
});

afterEach(() => {
  setSystemTime(); // back to the real clock
});

describe("magic link sign-in", () => {
  test("clicking the emailed link signs the resident in and lands them in the portal", async () => {
    const user = seedUser(testDb, { email: RESIDENT_EMAIL });

    const response = await clickMagicLink(
      await requestMagicLink(RESIDENT_EMAIL),
    );

    expect(response.status).toBe(302);
    expect(new URL(response.headers.get("Location")!, BASE_URL).pathname).toBe(
      "/resident",
    );

    const session = await getSession(toCookieHeader(response));
    expect(session?.user.id).toBe(user.id);
  });

  test("a link only works once", async () => {
    seedUser(testDb, { email: RESIDENT_EMAIL });
    const link = await requestMagicLink(RESIDENT_EMAIL);

    await clickMagicLink(link);
    const secondClick = await clickMagicLink(link);

    expect(secondClick.headers.get("Location")).toContain("/resident/login");
    expect(await getSession(toCookieHeader(secondClick))).toBeNull();
    expect(sessionCount()).toBe(1);
  });

  test("a link stops working after 5 minutes", async () => {
    seedUser(testDb, { email: RESIDENT_EMAIL });
    const link = await requestMagicLink(RESIDENT_EMAIL);

    setSystemTime(new Date(Date.now() + 6 * 60 * 1000));
    const response = await clickMagicLink(link);

    expect(response.headers.get("Location")).toContain("/resident/login");
    expect(sessionCount()).toBe(0);
  });

  test("a made-up token is rejected", async () => {
    seedUser(testDb, { email: RESIDENT_EMAIL });
    const link = new URL(await requestMagicLink(RESIDENT_EMAIL));
    link.searchParams.set("token", "not-a-real-token");

    const response = await clickMagicLink(link.toString());

    expect(response.headers.get("Location")).toContain("/resident/login");
    expect(sessionCount()).toBe(0);
  });
});

describe("only pre-registered residents can get in", () => {
  test("calling the auth API directly with an unknown email sends nothing and creates no account", async () => {
    const response = await authHandler(
      new Request(`${BASE_URL}/api/auth/sign-in/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "stranger@test.com",
          callbackURL: "/resident",
        }),
      }),
    );

    expect(response.ok).toBe(false);
    expect(lastResendRequest).toBeNull();
    const created = testDb
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, "stranger@test.com"))
      .get();
    expect(created).toBeUndefined();
  });

  test("anonymous sign-in no longer exists", async () => {
    const response = await authHandler(
      new Request(`${BASE_URL}/api/auth/sign-in/anonymous`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      }),
    );

    expect(response.status).toBe(404);
    expect(sessionCount()).toBe(0);
  });
});

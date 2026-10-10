import { describe, test, expect, beforeEach, mock } from "bun:test";
import { createTestDatabase, seedUser, type TestDatabase } from "../helpers/db";
import { makeTestContext, makeFormRequest } from "../helpers/context";

// mock.module() must be called before the dynamic imports below. The factory
// reads `testDb` lazily, so updating it in beforeEach is picked up per test.
let testDb: TestDatabase;

mock.module("~/util/database.server", () => ({
  getDatabase: () => testDb,
}));

const { isAuthenticated, isAdmin } = await import("~/util/authHelpers.server");
const ResidentLogin = await import("~/routes/ResidentLogin");
const { signIn, requestWithCookie, BASE_URL } = await import("../helpers/auth");

/** Run a guard and hand back whatever it threw (a redirect or error Response). */
async function thrownBy(guard: Promise<unknown>) {
  try {
    await guard;
  } catch (error) {
    return error as Response;
  }
  throw new Error("Expected the guard to throw");
}

beforeEach(() => {
  testDb = createTestDatabase();
});

describe("isAuthenticated", () => {
  test("sends signed-out visitors to the login page", async () => {
    const response = await thrownBy(
      isAuthenticated(requestWithCookie("/resident"), makeTestContext()),
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/resident/login");
  });

  test("answers 401 for signed-out API-style requests", async () => {
    const response = await thrownBy(
      isAuthenticated(
        requestWithCookie("/resident/documents/download"),
        makeTestContext(),
        {
          returnUnauthorized: true,
        },
      ),
    );

    expect(response.status).toBe(401);
  });

  test("ignores a forged session cookie", async () => {
    const response = await thrownBy(
      isAuthenticated(
        requestWithCookie(
          "/resident",
          "better-auth.session_token=forged.value",
        ),
        makeTestContext(),
      ),
    );

    expect(response.headers.get("Location")).toBe("/resident/login");
  });

  test("returns the session for a signed-in resident", async () => {
    const user = seedUser(testDb, { email: "resident@test.com" });
    const cookie = await signIn(user.email);

    const session = await isAuthenticated(
      requestWithCookie("/resident", cookie),
      makeTestContext(),
    );

    expect(session.user.id).toBe(user.id);
  });
});

describe("isAdmin", () => {
  test("sends signed-in non-admins back to the resident home page", async () => {
    seedUser(testDb, { email: "owner@test.com", role: "owner" });
    const cookie = await signIn("owner@test.com");

    const response = await thrownBy(
      isAdmin(
        requestWithCookie("/resident/management", cookie),
        makeTestContext(),
      ),
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/resident");
  });

  test("answers 403 for non-admin API-style requests", async () => {
    seedUser(testDb, { email: "owner@test.com", role: "owner" });
    const cookie = await signIn("owner@test.com");

    const response = await thrownBy(
      isAdmin(
        requestWithCookie("/resident/management", cookie),
        makeTestContext(),
        {
          returnUnauthorized: true,
        },
      ),
    );

    expect(response.status).toBe(403);
  });

  test("still sends signed-out visitors to the login page", async () => {
    const response = await thrownBy(
      isAdmin(requestWithCookie("/resident/management"), makeTestContext()),
    );

    expect(response.headers.get("Location")).toBe("/resident/login");
  });

  test("lets admins through", async () => {
    const admin = seedUser(testDb, { email: "admin@test.com", role: "admin" });
    const cookie = await signIn(admin.email);

    const session = await isAdmin(
      requestWithCookie("/resident/management", cookie),
      makeTestContext(),
    );

    expect(session.user.id).toBe(admin.id);
  });
});

describe("login page", () => {
  const loader = (cookie?: string) =>
    ResidentLogin.loader({
      request: requestWithCookie("/resident/login", cookie),
      context: makeTestContext(),
      params: {},
    } as Parameters<typeof ResidentLogin.loader>[0]);

  test("sends already signed-in residents straight to the portal", async () => {
    seedUser(testDb, { email: "resident@test.com" });
    const cookie = await signIn("resident@test.com");

    const result = await loader(cookie);

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get("Location")).toBe("/resident");
  });

  test("remembers that a sign-in email was just sent", async () => {
    seedUser(testDb, { email: "resident@test.com" });
    const sent = (await ResidentLogin.action({
      request: makeFormRequest(`${BASE_URL}/resident/login`, {
        email: "resident@test.com",
      }),
      context: makeTestContext(),
      params: {},
    } as Parameters<typeof ResidentLogin.action>[0])) as Response;
    const trackerCookie = sent.headers.get("Set-Cookie")!.split(";")[0];

    expect(await loader(trackerCookie)).toEqual({ magicLinkEmailSent: true });
    expect(await loader()).toEqual({ magicLinkEmailSent: false });
  });

  test("requesting a new email clears the sent state", async () => {
    const response = (await ResidentLogin.action({
      request: makeFormRequest(`${BASE_URL}/resident/login`, {
        intent: "reset-email",
      }),
      context: makeTestContext(),
      params: {},
    } as Parameters<typeof ResidentLogin.action>[0])) as Response;

    const setCookie = response.headers.get("Set-Cookie")!;
    // The browser drops the cookie right away...
    expect(setCookie).toMatch(/Max-Age=(0|-\d+)/);
    // ...and even if it were sent back, it no longer means "email sent"
    expect(await loader(setCookie.split(";")[0])).toEqual({
      magicLinkEmailSent: false,
    });
  });
});

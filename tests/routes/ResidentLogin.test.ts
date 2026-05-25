import { describe, test, expect, beforeEach, mock } from "bun:test";
import { lastResendRequest } from "../mocks/handlers/resend";
import { createTestDatabase, seedUser, type TestDatabase } from "../helpers/db";
import { makeTestContext, makeFormRequest } from "../helpers/context";

// mock.module() must be called before the dynamic import of the action below.
// The factory closure reads `testDb` lazily at call time, so updating it in
// beforeEach is picked up correctly by each test.
let testDb: TestDatabase;

mock.module("~/util/database.server", () => ({
  getDatabase: () => testDb,
}));

// Dynamic import ensures the module mock above is applied before ResidentLogin
// (and its transitive dep on getDatabase) is evaluated.
const { action } = await import("~/routes/ResidentLogin");

const ACTION_URL = "http://localhost:3000/resident/login";

beforeEach(() => {
  testDb = createTestDatabase();
});

describe("ResidentLogin action — loginMethod=full (magic link)", () => {
  test("returns error when email field is missing", async () => {
    const request = makeFormRequest(ACTION_URL, { loginMethod: "full" });
    const result = await action({ request, context: makeTestContext(), params: {} });

    expect(result).toMatchObject({ error: "Email is required" });
    expect(lastResendRequest).toBeNull();
  });

  test("returns error when email is not registered", async () => {
    const request = makeFormRequest(ACTION_URL, {
      loginMethod: "full",
      email: "nobody@example.com",
    });
    const result = await action({ request, context: makeTestContext(), params: {} });

    expect(result).toMatchObject({
      error: expect.stringContaining("pre-registered accounts"),
    });
    expect(lastResendRequest).toBeNull();
  });

  test("returns 200 with Set-Cookie when user exists", async () => {
    seedUser(testDb, { email: "resident@test.com" });

    const request = makeFormRequest(ACTION_URL, {
      loginMethod: "full",
      email: "resident@test.com",
    });
    const result = await action({ request, context: makeTestContext(), params: {} });

    expect(result).toBeInstanceOf(Response);
    const response = result as Response;
    expect(response.status).toBe(200);
    expect(response.headers.get("Set-Cookie")).toContain("email-tracker=");
  });

  test("sends email to Resend with correct to, from, and subject", async () => {
    seedUser(testDb, { email: "resident@test.com" });

    const request = makeFormRequest(ACTION_URL, {
      loginMethod: "full",
      email: "resident@test.com",
    });
    await action({ request, context: makeTestContext(), params: {} });

    expect(lastResendRequest).toMatchObject({
      from: "no-reply@skybox-lofts.com",
      to: ["resident@test.com"],
      subject: "Here is your one-time sign in link",
    });
  });

  test("email html contains the user's first name", async () => {
    seedUser(testDb, { email: "alice@test.com", firstName: "Alice" });

    const request = makeFormRequest(ACTION_URL, {
      loginMethod: "full",
      email: "alice@test.com",
    });
    await action({ request, context: makeTestContext(), params: {} });

    expect(lastResendRequest).not.toBeNull();
    expect(lastResendRequest!.html as string).toContain("Alice");
  });

  test("does not call Resend when user is not found", async () => {
    const request = makeFormRequest(ACTION_URL, {
      loginMethod: "full",
      email: "ghost@test.com",
    });
    await action({ request, context: makeTestContext(), params: {} });

    expect(lastResendRequest).toBeNull();
  });

  test("returns generic error when an unexpected error is thrown", async () => {
    seedUser(testDb, { email: "resident@test.com" });

    const { server } = await import("../mocks/server");
    const { http, HttpResponse } = await import("msw");
    server.use(
      http.post("https://api.resend.com/emails", () => HttpResponse.error()),
    );

    const request = makeFormRequest(ACTION_URL, {
      loginMethod: "full",
      email: "resident@test.com",
    });
    const result = await action({ request, context: makeTestContext(), params: {} });

    expect(result).toMatchObject({
      error: expect.stringContaining("Something went wrong"),
    });
  });
});

describe("ResidentLogin action — unknown loginMethod", () => {
  test("throws for an unknown loginMethod value", async () => {
    const request = makeFormRequest(ACTION_URL, { loginMethod: "magic" });

    await expect(
      action({ request, context: makeTestContext(), params: {} }),
    ).rejects.toThrow("Unknown login method: magic");
  });
});

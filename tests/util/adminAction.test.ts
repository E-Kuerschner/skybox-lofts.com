import { describe, test, expect, beforeEach, mock, spyOn } from "bun:test";
import { makeTestContext, makeFormRequest } from "../helpers/context";

// mock.module() must be called before the dynamic import below. The factories
// read `currentUser` / `fakeDb` lazily, so updating them per test is picked up.
type FakeUser = { id: string; role: string | null };

let currentUser: FakeUser | null;
let lastAuthOptions: unknown;
const fakeDb = { name: "fake-db" };

mock.module("~/util/authHelpers.server", () => ({
  isAuthenticated: async (
    _request: Request,
    _context: unknown,
    options?: { returnUnauthorized?: boolean },
  ) => {
    lastAuthOptions = options;
    // Mirrors the real helper: no session -> 401 when asked, else a redirect.
    if (!currentUser) {
      throw options?.returnUnauthorized
        ? new Response("Unauthorized", { status: 401 })
        : new Response(null, { status: 302 });
    }
    return { user: currentUser, session: { id: "session-1" } };
  },
}));

mock.module("~/util/database.server", () => ({
  getDatabase: () => fakeDb,
}));

const { runAdminAction } = await import("~/util/crud/adminAction.server");

const URL = "http://localhost:3000/resident/somewhere";
const DEFAULT_REFUSAL =
  "Only building administrators can make changes here. If you think you should have access, please contact a board member.";

const admin: FakeUser = { id: "admin-1", role: "admin" };
const owner: FakeUser = { id: "owner-1", role: "owner" };
const renter: FakeUser = { id: "renter-1", role: "renter" };
const noRole: FakeUser = { id: "nobody-1", role: null };

function okHandler() {
  return mock(async () => ({ success: true as const, message: "Done." }));
}

function run(
  fields: Record<string, string>,
  handlers: Parameters<typeof runAdminAction>[1],
  options?: Parameters<typeof runAdminAction>[2],
) {
  const request = makeFormRequest(URL, fields);
  const context = makeTestContext();
  return {
    request,
    context,
    result: runAdminAction({ request, context }, handlers, options),
  };
}

beforeEach(() => {
  currentUser = null;
  lastAuthOptions = undefined;
});

describe("runAdminAction — signing in", () => {
  test("someone who isn't signed in gets a 401 rather than a redirect", async () => {
    const create = okHandler();

    const { result } = run({ intent: "create" }, { create });

    const thrown = await result.catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(401);
    expect(lastAuthOptions).toEqual({ returnUnauthorized: true });
    expect(create).not.toHaveBeenCalled();
  });
});

describe("runAdminAction — default (admins only)", () => {
  test("lets an admin through to the handler", async () => {
    currentUser = admin;
    const create = okHandler();

    const { result } = run({ intent: "create" }, { create });

    expect(await result).toEqual({ success: true, message: "Done." });
    expect(create).toHaveBeenCalledTimes(1);
  });

  test.each([
    ["an owner", owner],
    ["a renter", renter],
    ["someone with no role", noRole],
  ])("refuses %s with the standard message", async (_label, user) => {
    currentUser = user;
    const create = okHandler();

    const { result, request } = run({ intent: "create" }, { create });

    expect(await result).toEqual({ success: false, error: DEFAULT_REFUSAL });
    expect(create).not.toHaveBeenCalled();
    // Refused before the form is read.
    expect(request.bodyUsed).toBe(false);
  });
});

describe("runAdminAction — allowedRoles", () => {
  const options = { allowedRoles: ["admin", "owner"] };

  test("lets every listed role through", async () => {
    for (const user of [admin, owner]) {
      currentUser = user;
      const update = okHandler();

      const { result } = run({ intent: "update" }, { update }, options);

      expect(await result).toMatchObject({ success: true });
      expect(update).toHaveBeenCalledTimes(1);
    }
  });

  test("still refuses roles that aren't listed", async () => {
    for (const user of [renter, noRole]) {
      currentUser = user;
      const update = okHandler();

      const { result } = run({ intent: "update" }, { update }, options);

      expect(await result).toEqual({ success: false, error: DEFAULT_REFUSAL });
      expect(update).not.toHaveBeenCalled();
    }
  });

  test("is the whole list - admins aren't let in unless they're listed", async () => {
    currentUser = admin;
    const update = okHandler();

    const { result } = run(
      { intent: "update" },
      { update },
      { allowedRoles: ["owner"] },
    );

    expect(await result).toMatchObject({ success: false });
    expect(update).not.toHaveBeenCalled();
  });

  test("shows the route's own refusal message when it gives one", async () => {
    currentUser = renter;

    const { result } = run(
      { intent: "update" },
      { update: okHandler() },
      { ...options, forbiddenMessage: "Only owners can do this." },
    );

    expect(await result).toEqual({
      success: false,
      error: "Only owners can do this.",
    });
  });
});

describe("runAdminAction — picking the handler", () => {
  test("runs only the handler named by the form's intent", async () => {
    currentUser = admin;
    const create = okHandler();
    const remove = okHandler();

    const { result } = run({ intent: "delete" }, { create, delete: remove });

    await result;
    expect(remove).toHaveBeenCalledTimes(1);
    expect(create).not.toHaveBeenCalled();
  });

  test.each<[string, Record<string, string>]>([
    ["is missing", {}],
    ["doesn't match any handler", { intent: "launch" }],
    ["names an inherited object property", { intent: "toString" }],
  ])("refuses a request whose intent %s", async (_label, fields) => {
    currentUser = admin;
    const create = okHandler();

    const { result } = run(fields, { create });

    expect(await result).toEqual({
      success: false,
      error: "Something went wrong. Please refresh and try again.",
    });
    expect(create).not.toHaveBeenCalled();
  });

  test("gives the handler the request, context, form, session and database", async () => {
    currentUser = owner;
    const update = okHandler();

    const { result, request, context } = run(
      { intent: "update", recordId: "7" },
      { update },
      { allowedRoles: ["admin", "owner"] },
    );
    await result;

    const [args] = update.mock.calls[0] as unknown as [
      Parameters<Parameters<typeof runAdminAction>[1][string]>[0],
    ];
    expect(args.request).toBe(request);
    expect(args.context).toBe(context);
    expect(args.formData.get("recordId")).toBe("7");
    expect(args.session.user).toMatchObject(owner as never);
    expect(args.db).toBe(fakeDb as never);
  });

  test("passes the handler's own result back, including errors it returns", async () => {
    currentUser = admin;

    const { result } = run(
      { intent: "update" },
      {
        update: async () => ({ success: false, error: "That isn't yours." }),
      },
    );

    expect(await result).toEqual({ success: false, error: "That isn't yours." });
  });
});

describe("runAdminAction — unexpected failures", () => {
  test("logs a handler crash and returns a friendly apology instead", async () => {
    currentUser = admin;
    const consoleError = spyOn(console, "error").mockImplementation(() => {});
    const crash = new Error("database is on fire");

    const { result } = run(
      { intent: "create" },
      {
        create: async () => {
          throw crash;
        },
      },
    );

    expect(await result).toEqual({
      success: false,
      error: "Something went wrong on our end. Please try again in a moment.",
    });
    expect(consoleError).toHaveBeenCalledWith(
      'Admin action "create" failed:',
      crash,
    );
    consoleError.mockRestore();
  });
});

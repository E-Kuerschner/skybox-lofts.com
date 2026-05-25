import type { AppLoadContext } from "react-router";

export function makeTestContext(): AppLoadContext {
  return {
    cloudflare: {
      env: {
        BETTER_AUTH_SECRET: "test-secret-that-is-at-least-32-chars!!",
        BETTER_AUTH_URL: "http://localhost:3000",
        APP_SECRET: "test-app-secret",
        RESEND_KEY: "re_test_api_key",
        CONTACT_US_EMAIL: "contact@test.com",
        VALUE_FROM_CLOUDFLARE: "Hello from Cloudflare",
        CLOUDFLARE_ACCOUNT_ID: "test-account-id",
        CLOUDFLARE_ACCOUNT_TOKEN: "test-token",
        CLOUDFLARE_DATABASE_ID: "test-db-id",
        ENVIRONMENT: "test",
        // These bindings are never accessed in tests — the DB mock intercepts
        // getDatabase() before APP is used, and DOCUMENTS/ASSETS aren't touched
        // by the login flow.
        DOCUMENTS: {} as R2Bucket,
        APP: {} as D1Database,
        ASSETS: {} as Fetcher,
      } satisfies Env,
      ctx: {
        waitUntil: () => {},
        passThroughOnException: () => {},
      } as unknown as ExecutionContext,
    },
  };
}

/** Build a URLSearchParams-encoded POST Request for a route action. */
export function makeFormRequest(
  url: string,
  fields: Record<string, string>,
): Request {
  const body = new URLSearchParams(fields);
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
}

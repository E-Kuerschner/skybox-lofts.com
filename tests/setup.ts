import { beforeAll, afterEach, afterAll } from "bun:test";
import { server } from "./mocks/server";
import { resetResendCapture } from "./mocks/handlers/resend";

// Per https://vitest.dev/guide/mocking/requests (same pattern for msw/node)
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  resetResendCapture();
});
afterAll(() => server.close());

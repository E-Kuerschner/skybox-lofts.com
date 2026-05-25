import { describe, test, expect, spyOn } from "bun:test";
import { sendEmail } from "~/email/sendEmail.server";
import { lastResendRequest } from "../mocks/handlers/resend";

const mockEnv = {
  RESEND_KEY: "re_test_api_key",
} as Env;

const mockTemplate = {
  html: "<p>Hello, Alice</p>",
  debugMessage: "DEBUG: should not appear in prod tests",
};

describe("sendEmail", () => {
  test("calls Resend with correct to, from, subject, and html in production mode", async () => {
    await sendEmail(mockEnv, "alice@test.com", "Your sign-in link", mockTemplate);

    expect(lastResendRequest).not.toBeNull();
    expect(lastResendRequest).toMatchObject({
      from: "no-reply@skybox-lofts.com",
      to: ["alice@test.com"],
      subject: "Your sign-in link",
      html: "<p>Hello, Alice</p>",
    });
  });

  test("does not log the debugMessage in production mode", async () => {
    const consoleSpy = spyOn(console, "log");
    await sendEmail(mockEnv, "alice@test.com", "Your sign-in link", mockTemplate);
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("DEBUG"),
    );
    consoleSpy.mockRestore();
  });

  test("logs and throws when the API returns an error", async () => {
    const consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});

    const { server } = await import("../mocks/server");
    const { http, HttpResponse } = await import("msw");
    server.use(
      http.post("https://api.resend.com/emails", () =>
        HttpResponse.json(
          { name: "validation_error", message: "Invalid to" },
          { status: 422 },
        ),
      ),
    );

    await expect(
      sendEmail(mockEnv, "bad@test.com", "Subject", mockTemplate),
    ).rejects.toThrow("Invalid to");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Resend error:",
      expect.anything(),
    );
    consoleErrorSpy.mockRestore();
  });
});

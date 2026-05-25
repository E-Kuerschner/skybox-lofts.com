import { http, HttpResponse } from "msw";

// Captures the last request body sent to Resend so tests can assert on it.
export let lastResendRequest: Record<string, unknown> | null = null;

export function resetResendCapture() {
  lastResendRequest = null;
}

export const resendHandlers = [
  http.post("https://api.resend.com/emails", async ({ request }) => {
    lastResendRequest = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: "mock-email-id-123" }, { status: 200 });
  }),
];

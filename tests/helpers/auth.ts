import { lastResendRequest } from "../mocks/handlers/resend";
import { makeTestContext } from "./context";
import { getAuth } from "~/auth";

export const BASE_URL = "http://localhost:3000";

/** Send a request through Better Auth exactly as the /api/auth/* route does. */
export function authHandler(request: Request) {
  return getAuth(makeTestContext()).handler(request);
}

/**
 * Ask Better Auth to email a magic link, then pull the link out of the email
 * the (mocked) Resend API received.
 */
export async function requestMagicLink(email: string) {
  await getAuth(makeTestContext()).api.signInMagicLink({
    body: {
      email,
      callbackURL: "/resident",
      errorCallbackURL: "/resident/login",
    },
    headers: new Headers(),
  });

  const html = lastResendRequest?.html as string | undefined;
  const link = html?.match(/href="([^"]*\/magic-link\/verify[^"]*)"/)?.[1];
  if (!link) {
    throw new Error("No magic link found in the sign-in email");
  }
  // The template HTML-escapes the URL's query separators
  return link.replaceAll("&amp;", "&");
}

/** Click a magic link: GET its verify URL through the auth handler. */
export function clickMagicLink(link: string) {
  return authHandler(new Request(link));
}

/** Turn a response's Set-Cookie headers into a Cookie request header. */
export function toCookieHeader(response: Response) {
  return response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}

/** Sign a seeded user in through the real magic link flow. */
export async function signIn(email: string) {
  const response = await clickMagicLink(await requestMagicLink(email));
  return toCookieHeader(response);
}

/** A request carrying the given Cookie header (or none). */
export function requestWithCookie(path: string, cookie?: string) {
  return new Request(`${BASE_URL}${path}`, {
    headers: cookie ? { Cookie: cookie } : {},
  });
}

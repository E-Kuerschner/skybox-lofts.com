import type { Route } from "./+types/ResidentLogin";
import { redirect, createCookie } from "react-router";
import { getAuth, USER_NOT_FOUND } from "~/auth";
import { PasswordEntryForm } from "~/components/PasswordEntryForm";
import TextLogo from "../components/text-logo.svg";

// cookie to track whether the user has been sent a magic link or not yet
const emailTrackerCookie = createCookie("email-tracker", {
  maxAge: 60 * 5, // 5 minutes
});

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const loginMethod = formData.get("loginMethod") as string;
  const intent = formData.get("intent") as string;

  if (intent && intent === "reset-email") {
    return new Response(null, {
      status: 200,
      headers: {
        "Set-Cookie": await emailTrackerCookie.serialize(null, { maxAge: -1 }),
      },
    });
  }

  if (loginMethod === "anonymous") {
    const password = formData.get("password") as string;
    if (!password) {
      return {
        error: "Password is required",
      };
    }

    const appSecret = context.cloudflare.env.APP_SECRET;
    if (password !== appSecret) {
      return {
        error: "Invalid password",
      };
    }

    try {
      const auth = getAuth(context);
      const session = await auth.api.signInAnonymous({
        headers: request.headers,
        returnHeaders: true,
      });

      if (!session) {
        throw new Error("Failed to create session");
      }

      return redirect("/resident", {
        headers: session.headers,
      });
    } catch (error) {
      return {
        error: "Sign in failed. Please try again.",
      };
    }
  } else if (loginMethod === "full") {
    const email = formData.get("email") as string;
    if (!email) {
      return {
        error: "Email is required",
      };
    }

    const auth = getAuth(context);
    try {
      // check /app/auth/index.ts - this function will intentionally throw if the email is not found in the DB
      await auth.api.signInMagicLink({
        body: {
          email,
          callbackURL: "/resident",
          errorCallbackURL: "/resident/login",
        },
        headers: request.headers,
      });

      return new Response(null, {
        status: 200,
        headers: {
          "Set-Cookie": await emailTrackerCookie.serialize("sent"),
        },
      });
    } catch (error) {
      if ((error as Error).message === USER_NOT_FOUND) {
        return {
          error:
            "Only pre-registered accounts may sign in. Please contact an administrator for assistance.",
        };
      }
    }
  } else {
    throw new Error(`Unknown login method: ${loginMethod}`);
  }
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session) {
    return redirect("/resident");
  }

  const cookieHeader = request.headers.get("Cookie");
  const sentStatus = await emailTrackerCookie.parse(cookieHeader);

  return { magicLinkEmailSent: sentStatus === "sent" };
}

export default function ResidentLogin({ loaderData }: Route.ComponentProps) {
  const magicLinkEmailSent = loaderData.magicLinkEmailSent ?? false;
  return (
    <main className="flex flex-col items-center justify-center min-h-screen site-bg">
      <PasswordEntryForm magicLinkEmailSent={magicLinkEmailSent} />
    </main>
  );
}

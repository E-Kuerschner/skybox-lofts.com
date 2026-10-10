import type { Route } from "./+types/ResidentLogin";
import { redirect, createCookie } from "react-router";
import { getAuth, USER_NOT_FOUND } from "~/auth";
import { SignInForm } from "~/components/SignInForm";

// cookie to track whether the user has been sent a magic link or not yet
const emailTrackerCookie = createCookie("email-tracker", {
  maxAge: 60 * 5, // 5 minutes
});

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent && intent === "reset-email") {
    return new Response(null, {
      status: 200,
      headers: {
        "Set-Cookie": await emailTrackerCookie.serialize(null, { maxAge: -1 }),
      },
    });
  }

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
    console.error("Magic link sign-in error:", error);
    return {
      error: "Something went wrong. Please try again.",
    };
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
      <SignInForm magicLinkEmailSent={magicLinkEmailSent} />
    </main>
  );
}

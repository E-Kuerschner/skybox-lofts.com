import type { Route } from ".react-router/types/app/routes/resident/+types";
import { getAuth } from "~/auth";
import { PasswordEntryForm } from "~/components/PasswordEntryForm";
import { redirect } from "react-router";
import TextLogo from "../../components/text-logo.svg";

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
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
    console.error("Anonymous sign in failed:", error);
    return {
      error: "Sign in failed. Please try again.",
    };
  }
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  console.log("login session", session);

  if (session) {
    return redirect("/resident");
  }

  return null;
}

export default function ResidentLogin() {
  return (
    <main className="flex flex-col gap-4 items-center justify-center min-h-screen pt-16 pb-4 bg-gradient-to-b from-stone-100 to-neutral-50">
      <a href="/" aria-label="Go home">
        <img
          src={TextLogo}
          alt="Skybox Lofts"
          className="drop-shadow-xl hover:scale-[1.05] transition-transform duration-200"
        />
      </a>
      <div className="text-center space-y-8 px-6">
        <PasswordEntryForm />
      </div>
    </main>
  );
}

import type { Route } from "./+types/resident";
import { useRevalidator } from "react-router";
import { authClient } from "~/util/authClient";
import { getAuth } from "~/auth";
import { PasswordEntryForm } from "~/components/PasswordEntryForm";

export async function loader({ request, context }: Route.LoaderArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return {
    session,
  };
}

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

    return new Response(null, {
      status: 200,
      headers: session.headers,
    });
  } catch (error) {
    console.error("Anonymous sign in failed:", error);
    return {
      error: "Sign in failed. Please try again.",
    };
  }
}

export default function Resident({ loaderData }: Route.ComponentProps) {
  const { session } = loaderData;
  const revalidator = useRevalidator();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      revalidator.revalidate();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen pt-16 pb-4 bg-gradient-to-b from-stone-100 to-neutral-50">
      <div className="text-center space-y-8 px-6">
        <h1 className="text-4xl font-bold text-foreground">
          Resident Area
        </h1>

        {session?.user ? (
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 max-w-md mx-auto border shadow-lg">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Session Info
              </h2>
              <div className="space-y-2 text-left">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">User ID:</span>{" "}
                  {session.user.id}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Name:</span> {session.user.name}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Anonymous:</span>{" "}
                  {session.user.isAnonymous ? "Yes" : "No"}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Session ID:</span>{" "}
                  {session.session.id}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-block px-8 py-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-lg transition-colors duration-200 text-lg shadow"
            >
              Sign out
            </button>
          </div>
        ) : (
          <PasswordEntryForm />
        )}
      </div>
    </main>
  );
}

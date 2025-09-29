import type { Route } from "./+types/resident";
import { authClient } from "~/util/authClient";
import { getAuth } from "~/auth";

const { useSession } = authClient;

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

export default function Resident({ actionData }: Route.ComponentProps) {
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen pt-16 pb-4">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Resident Area
        </h1>

        {isPending ? (
          <div className="text-lg text-gray-600 dark:text-gray-400">
            Loading...
          </div>
        ) : session?.user ? (
          <div className="space-y-6">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Session Info
              </h2>
              <div className="space-y-2 text-left">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">User ID:</span>{" "}
                  {session.user.id}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Name:</span> {session.user.name}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Anonymous:</span>{" "}
                  {session.user.isAnonymous ? "Yes" : "No"}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Session ID:</span>{" "}
                  {session.session.id}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-block px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <form method="post" className="max-w-md mx-auto space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Enter Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white text-lg"
                  placeholder="Password"
                />
              </div>
              {actionData?.error && (
                <div className="text-red-600 dark:text-red-400 text-sm">
                  {actionData.error}
                </div>
              )}
              <button
                type="submit"
                className="inline-flex items-center justify-center w-full md:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Sign in
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

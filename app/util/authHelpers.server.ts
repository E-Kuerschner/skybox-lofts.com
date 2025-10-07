import { getAuth } from "~/auth";
import { type AppLoadContext, redirect } from "react-router";

type Options = {
  skipRedirect?: boolean;
};

export async function isAuthenticated(
  request: Request,
  context: AppLoadContext,
  options?: Options,
) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    if (options?.skipRedirect) {
      throw new Error("Unauthorized");
    }

    return redirect("/resident/login");
  }

  return session;
}

import { getAuth } from "~/auth";
import { type AppLoadContext, redirect } from "react-router";

export async function isAuthenticated(
  request: Request,
  context: AppLoadContext,
) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/resident/login");
  }

  return session;
}

import { type AppLoadContext, redirect } from "react-router";
import { getAuth } from "~/auth";

type Options = {
  returnUnauthorized?: boolean;
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
    if (options?.returnUnauthorized) {
      throw new Response("Unauthorized", { status: 401 });
    }

    throw redirect("/resident/login");
  }
}

import type { Route } from "./+types/auth";
import { getAuth } from "~/auth";

/*
  This resource route is required integration for Better Auth.
  Here, handlers are set up for all HTTP requests to the splat/catchall route "auth/*" (see app/routes.ts)
 */

export async function loader({ request, context }: Route.LoaderArgs) {
  const auth = getAuth(context);
  return auth.handler(request);
}
export async function action({ request, context }: Route.ActionArgs) {
  const auth = getAuth(context);
  return auth.handler(request);
}

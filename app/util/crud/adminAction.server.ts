import type { AppLoadContext } from "react-router";
import { isAuthenticated } from "~/util/authHelpers.server";
import { getDatabase } from "~/util/database.server";
import { type ActionResult, actionError } from "./actionResult";

type Session = Awaited<ReturnType<typeof isAuthenticated>>;

export type AdminActionArgs = {
  request: Request;
  context: AppLoadContext;
  formData: FormData;
  session: Session;
  db: ReturnType<typeof getDatabase>;
};

export type AdminActionHandlers = Record<
  string,
  (args: AdminActionArgs) => Promise<ActionResult>
>;

/**
 * Runs the admin-only half of a route's action.
 *
 * Every create/update/delete in the app should go through here so the
 * authorization rules are written once:
 *
 * - Not signed in at all -> 401, handled by the route error boundary. There is
 *   no friendly copy for this because the person has no session to speak of.
 * - Signed in but not an admin -> a normal `ActionResult` error, so the page can
 *   explain what happened in plain language instead of a blank error screen.
 *   This is the case that matters: most people using the site are residents.
 * - Unexpected failure -> logged for us, generic apology for them.
 *
 * Handlers are keyed by the form's `intent` field.
 */
export async function runAdminAction(
  {
    request,
    context,
  }: {
    request: Request;
    context: AppLoadContext;
  },
  handlers: AdminActionHandlers,
): Promise<ActionResult> {
  const session = await isAuthenticated(request, context, {
    returnUnauthorized: true,
  });

  if (session.user.role !== "admin") {
    return actionError(
      "Only building administrators can make changes here. If you think you should have access, please contact a board member.",
    );
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (typeof intent !== "string" || !(intent in handlers)) {
    return actionError("Something went wrong. Please refresh and try again.");
  }

  try {
    return await handlers[intent]({
      request,
      context,
      formData,
      session,
      db: getDatabase(context),
    });
  } catch (error) {
    console.error(`Admin action "${intent}" failed:`, error);
    return actionError(
      "Something went wrong on our end. Please try again in a moment.",
    );
  }
}

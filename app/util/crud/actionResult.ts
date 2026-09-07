/**
 * The single shape every create/update/delete action in the app returns.
 *
 * Having one shape means the UI can render feedback the same way everywhere
 * (see `<ActionStatusBanner />`) instead of each page inventing its own
 * `{ error }` / `{ success, message }` / `{ success, error }` variation.
 */
export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export function actionSuccess(message: string): ActionResult {
  return { success: true, message };
}

export function actionError(error: string): ActionResult {
  return { success: false, error };
}

/** Narrows unknown fetcher/action data to an `ActionResult`. */
export function isActionResult(value: unknown): value is ActionResult {
  return (
    typeof value === "object" && value !== null && "success" in value
  );
}

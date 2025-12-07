import type { Route } from "./+types/documentDelete";
import { isAdmin } from "~/util/authHelpers.server";
import { getDatabase } from "~/util/database.server";
import { createActivityLogData } from "~/util/activityLogger.server";
import * as schema from "../../database/schema";

export async function action({ request, context }: Route.ActionArgs) {
  // Ensure user is admin
  const session = await isAdmin(request, context, { returnUnauthorized: true });

  try {
    const formData = await request.formData();
    const key = formData.get("key") as string;

    // Validate input
    if (!key || key.trim() === "") {
      return {
        success: false,
        error: "Invalid document key.",
      };
    }

    // Delete from R2
    await context.cloudflare.env.DOCUMENTS.delete(key);

    // Extract filename and category for success message and logging
    const keyParts = key.split("/");
    const filename = decodeURIComponent(keyParts.pop() || "document");
    const category = keyParts.join("/") || "unknown";

    // Log the activity
    const db = getDatabase(context);
    await db.insert(schema.activityLogs).values(
      createActivityLogData(session.user.id, "deleted", "document", null, {
        filename,
        category,
      })
    );

    return {
      success: true,
      message: `Successfully deleted "${filename}".`,
    };
  } catch (error) {
    console.error("Document delete error:", error);
    return {
      success: false,
      error: "An error occurred while deleting the document. Please try again.",
    };
  }
}

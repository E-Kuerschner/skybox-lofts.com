import type { Route } from "./+types/documentDelete";
import { isAdmin } from "~/util/authHelpers.server";

export async function action({ request, context }: Route.ActionArgs) {
  // Ensure user is admin
  await isAdmin(request, context, { returnUnauthorized: true });

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

    // Extract filename for success message
    const filename = decodeURIComponent(key.split("/").pop() || "document");

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

import type { Route } from "./+types/documentUpload";
import { isAdmin } from "~/util/authHelpers.server";
import { getDatabase } from "~/util/database.server";
import { logActivity } from "~/util/activityLogger.server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function action({ request, context }: Route.ActionArgs) {
  // Ensure user is admin
  const session = await isAdmin(request, context, { returnUnauthorized: true });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;

    // Validate inputs
    if (!file || !(file instanceof File)) {
      return {
        success: false,
        error: "Please select a file to upload.",
      };
    }

    if (!category || category.trim() === "") {
      return {
        success: false,
        error: "Please select or enter a category.",
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
      };
    }

    // Normalize category (lowercase, replace spaces with hyphens)
    const normalizedCategory = category.toLowerCase().trim().replace(/\s+/g, "-");

    // Create the R2 object key
    const key = `${normalizedCategory}/${file.name}`;

    // Check for duplicate filename
    const existingFiles = await context.cloudflare.env.DOCUMENTS.list({
      prefix: `${normalizedCategory}/`,
    });

    const isDuplicate = existingFiles.objects.some((obj: { key: string }) => obj.key === key);

    if (isDuplicate) {
      return {
        success: false,
        error: `A file named "${file.name}" already exists in the "${category}" category.`,
      };
    }

    // Upload to R2
    await context.cloudflare.env.DOCUMENTS.put(key, file, {
      httpMetadata: {
        contentType: file.type,
        contentDisposition: `attachment; filename="${encodeURIComponent(file.name)}"`,
      },
    });

    // Log the activity
    const db = getDatabase(context);
    await logActivity(db, session.user.id, "created", "document", null, {
      filename: file.name,
      category: normalizedCategory,
      fileSize: file.size,
    });

    return {
      success: true,
      message: `Successfully uploaded "${file.name}" to ${category}.`,
    };
  } catch (error) {
    console.error("Document upload error:", error);
    return {
      success: false,
      error: "An error occurred while uploading the document. Please try again.",
    };
  }
}

import type { Route } from "./+types/documentUpload";
import { isAdmin } from "~/util/authHelpers.server";
import { getDatabase } from "~/util/database.server";
import { createActivityLogData } from "~/util/activityLogger.server";
import { actionError, actionSuccess } from "~/util/crud/actionResult";
import {
  MAX_DOCUMENT_SIZE,
  categoryLabel,
  isDocumentCategory,
  splitExtension,
} from "~/routes/Documents/documents";
import * as schema from "../../database/schema";

const MAX_NAME_LENGTH = 120;

export async function action({ request, context }: Route.ActionArgs) {
  // Ensure user is admin
  const session = await isAdmin(request, context, { returnUnauthorized: true });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const category = String(formData.get("category") ?? "");
    const displayName = String(formData.get("displayName") ?? "")
      // A slash would put the file in a folder of its own
      .replace(/[\\/]/g, "-")
      .replace(/\s+/g, " ")
      .trim();

    // Validate inputs
    if (!(file instanceof File) || file.size === 0) {
      return actionError("Please choose a file to upload.");
    }

    if (!isDocumentCategory(category)) {
      return actionError("Please choose where the document should go.");
    }

    if (!displayName) {
      return actionError("Please give the document a name residents will see.");
    }

    if (displayName.length > MAX_NAME_LENGTH) {
      return actionError(
        `Please keep the name under ${MAX_NAME_LENGTH} characters.`,
      );
    }

    // Validate file size
    if (file.size > MAX_DOCUMENT_SIZE) {
      return actionError(
        `Files can be up to ${MAX_DOCUMENT_SIZE / 1024 / 1024} MB. This one is ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
      );
    }

    // The stored file is named what residents see, keeping the original
    // ending so it still opens in the right app once downloaded.
    const filename = `${displayName}${splitExtension(file.name).extension.toLowerCase()}`;
    const key = `${category}/${filename}`;

    if (await context.cloudflare.env.DOCUMENTS.head(key)) {
      return actionError(
        `There's already a document called "${filename}" in ${categoryLabel(category)}. Give this one a different name.`,
      );
    }

    // Upload to R2
    await context.cloudflare.env.DOCUMENTS.put(key, file, {
      httpMetadata: {
        contentType: file.type,
        contentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });

    // Log the activity
    const db = getDatabase(context);
    await db.insert(schema.activityLogs).values(
      createActivityLogData(session.user.id, "created", "document", null, {
        filename,
        category,
        fileSize: file.size,
      }),
    );

    return actionSuccess(
      `${displayName} was added to ${categoryLabel(category)}.`,
    );
  } catch (error) {
    console.error("Document upload error:", error);
    return actionError(
      "Something went wrong uploading the document. Please try again.",
    );
  }
}

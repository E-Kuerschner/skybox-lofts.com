import type { getDatabase } from "~/util/database.server";
import { activityLogs } from "../../database/schema";

type ActivityAction = "created" | "updated" | "deleted";
type EntityType = "resident" | "document" | "board_member";

interface ActivityMetadata {
  residentName?: string;
  residentEmail?: string;
  role?: string;
  filename?: string;
  category?: string;
  fileSize?: number;
  memberName?: string;
  memberRole?: string;
}

export async function logActivity(
  db: ReturnType<typeof getDatabase>,
  userId: string,
  action: ActivityAction,
  entityType: EntityType,
  entityId: string | null,
  metadata: ActivityMetadata,
) {
  try {
    await db.insert(activityLogs).values({
      userId,
      action,
      entityType,
      entityId,
      metadata: JSON.stringify(metadata),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw - activity logging should not break the main operation
  }
}

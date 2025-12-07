type ActivityAction = "created" | "updated" | "deleted";
type EntityType = "resident" | "document" | "board_member";

interface ActivityMetadata {
  residentName?: string;
  residentEmail?: string;
  unitNumber?: number;
  role?: string;
  filename?: string;
  category?: string;
  fileSize?: number;
  memberName?: string;
  memberRole?: string;
}

export function createActivityLogData(
  userId: string,
  action: ActivityAction,
  entityType: EntityType,
  entityId: string | null,
  metadata: ActivityMetadata,
) {
  return {
    userId,
    action,
    entityType,
    entityId,
    metadata: JSON.stringify(metadata),
  };
}

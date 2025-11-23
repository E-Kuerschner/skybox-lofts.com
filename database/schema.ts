import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export * from "./authSchema";
import { users } from "./authSchema";

export const boardMembers = sqliteTable("board_members", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role").notNull(),
});

export const activityLogs = sqliteTable("activity_logs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // 'created', 'updated', 'deleted'
  entityType: text("entity_type").notNull(), // 'resident', 'document', 'board_member'
  entityId: text("entity_id"), // ID of affected entity (nullable)
  metadata: text("metadata"), // JSON string with details (nullable)
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export * from "./authSchema";

export const boardMembers = sqliteTable("board_members", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role").notNull(),
});

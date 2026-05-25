import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { resolve } from "node:path";
import * as schema from "../../database/schema";

const MIGRATIONS_DIR = resolve(import.meta.dirname, "../../database/migrations");

export type TestDatabase = ReturnType<typeof createTestDatabase>;

export function createTestDatabase() {
  const sqlite = new Database(":memory:");
  const db = drizzle(sqlite, { schema, casing: "snake_case" });
  migrate(db, { migrationsFolder: MIGRATIONS_DIR });
  return db;
}

/** Insert a minimal resident user for testing the login flow. */
export function seedUser(
  db: TestDatabase,
  overrides: Partial<typeof schema.users.$inferInsert> = {},
) {
  const now = new Date();
  const user = {
    id: crypto.randomUUID(),
    name: "Test Resident",
    email: "resident@test.com",
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
    firstName: "Test",
    lastName: "Resident",
    unitNumber: 1,
    ...overrides,
  };
  db.insert(schema.users).values(user).run();
  return user;
}

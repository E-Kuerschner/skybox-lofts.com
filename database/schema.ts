import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export * from "./authSchema";
import { users } from "./authSchema";

export const boardMembers = sqliteTable("board_members", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name"), // Redundant (artifact of older design) - could use userId relation instead, but kept for simpler queries
  role: text("role").notNull(), // Position title: President, Treasurer, Secretary (immutable)
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }), // Nullable
});

export const boardMemberRelations = relations(boardMembers, ({ one }) => ({
  user: one(users, {
    fields: [boardMembers.userId],
    references: [users.id],
  }),
}));

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

/**
 * Building-vetted contractors residents can hire for work on their units.
 *
 * A contractor is discovered primarily by the services it offers, so services
 * live in their own curated lookup table (`contractor_services`) joined to
 * contractors many-to-many. Keeping services normalized means "Balcony Painting"
 * is always spelled the same way and can be used to group/filter the listing.
 */
export const contractors = sqliteTable("contractors", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  businessName: text("business_name").notNull(),
  contactName: text("contact_name"), // Owner / main point of contact (nullable)
  address: text("address"), // Single free-form line, geocodable by Google Maps (nullable)
  // Populated later by the Google Maps integration so pins can be placed without re-geocoding
  latitude: real("latitude"),
  longitude: real("longitude"),
  phone: text("phone"), // At least one of phone/email is required (enforced in the action)
  email: text("email"),
  notes: text("notes"), // Optional free-form context, e.g. "ask for the resident rate"
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/** Curated catalog of job types (e.g. "Balcony Painting"). Admin-extendable. */
export const contractorServices = sqliteTable(
  "contractor_services",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull(), // Display name, e.g. "AC Repair"
    slug: text("slug").notNull(), // URL/filter-safe key, e.g. "ac-repair"
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("contractor_services_slug_unique").on(table.slug)],
);

/** Join table: which services a contractor offers. */
export const contractorServiceLinks = sqliteTable(
  "contractor_service_links",
  {
    contractorId: integer("contractor_id", { mode: "number" })
      .notNull()
      .references(() => contractors.id, { onDelete: "cascade" }),
    serviceId: integer("service_id", { mode: "number" })
      .notNull()
      .references(() => contractorServices.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.contractorId, table.serviceId] }),
    index("contractor_service_links_service_idx").on(table.serviceId),
  ],
);

/** Photos live in the CONTRACTOR_PHOTOS R2 bucket; only the key is stored here. */
export const contractorPhotos = sqliteTable(
  "contractor_photos",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    contractorId: integer("contractor_id", { mode: "number" })
      .notNull()
      .references(() => contractors.id, { onDelete: "cascade" }),
    key: text("key").notNull(), // R2 object key, e.g. "contractors/12/a1b2c3.jpg"
    contentType: text("content_type"),
    sortOrder: integer("sort_order", { mode: "number" }).notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index("contractor_photos_contractor_idx").on(table.contractorId)],
);

export const contractorRelations = relations(contractors, ({ many }) => ({
  serviceLinks: many(contractorServiceLinks),
  photos: many(contractorPhotos),
}));

export const contractorServiceRelations = relations(
  contractorServices,
  ({ many }) => ({
    contractorLinks: many(contractorServiceLinks),
  }),
);

export const contractorServiceLinkRelations = relations(
  contractorServiceLinks,
  ({ one }) => ({
    contractor: one(contractors, {
      fields: [contractorServiceLinks.contractorId],
      references: [contractors.id],
    }),
    service: one(contractorServices, {
      fields: [contractorServiceLinks.serviceId],
      references: [contractorServices.id],
    }),
  }),
);

export const contractorPhotoRelations = relations(
  contractorPhotos,
  ({ one }) => ({
    contractor: one(contractors, {
      fields: [contractorPhotos.contractorId],
      references: [contractors.id],
    }),
  }),
);

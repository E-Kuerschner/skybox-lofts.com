import { describe, test, expect, beforeEach, mock } from "bun:test";
import { eq } from "drizzle-orm";
import * as schema from "../../database/schema";
import { createTestDatabase, seedUser, type TestDatabase } from "../helpers/db";
import { makeTestContext, makeFormRequest } from "../helpers/context";

// mock.module() must be called before the dynamic imports below. Both
// factories read `testDb` / `currentUser` lazily, so updating them per test is
// picked up.
let testDb: TestDatabase;
let currentUser: { id: string; role: string | null };

mock.module("~/util/database.server", () => ({
  getDatabase: () => testDb,
}));

mock.module("~/util/authHelpers.server", () => ({
  isAuthenticated: async () => ({ user: currentUser, session: {} }),
  isAdmin: async () => ({ user: currentUser, session: {} }),
}));

const { action } = await import("~/routes/Contractors");
const { canAddContractors, canManageContractor } = await import(
  "~/routes/Contractors/contractors.server"
);

const ACTION_URL = "http://localhost:3000/resident/contractors";

let admin: ReturnType<typeof seedUser>;
let owner: ReturnType<typeof seedUser>;
let otherOwner: ReturnType<typeof seedUser>;
let renter: ReturnType<typeof seedUser>;
let serviceId: number;

beforeEach(() => {
  testDb = createTestDatabase();
  admin = seedUser(testDb, { email: "admin@test.com", role: "admin" });
  owner = seedUser(testDb, { email: "owner@test.com", role: "owner" });
  otherOwner = seedUser(testDb, { email: "other@test.com", role: "owner" });
  renter = seedUser(testDb, { email: "renter@test.com", role: "renter" });
  serviceId = testDb
    .insert(schema.contractorServices)
    .values({ name: "Painting", slug: "painting" })
    .returning()
    .get().id;
});

function signInAs(user: { id: string; role?: string | null }) {
  currentUser = { id: user.id, role: user.role ?? null };
}

function submit(fields: Record<string, string>) {
  return action({
    request: makeFormRequest(ACTION_URL, fields),
    context: makeTestContext(),
    params: {},
  });
}

/** The fields a valid add/edit form posts, minus the list checkboxes. */
const listingFields = (name = "Northside Painting") => ({
  businessName: name,
  phone: "312-555-0100",
  serviceIds: String(serviceId),
});

function seedContractor(
  overrides: Partial<typeof schema.contractors.$inferInsert> = {},
) {
  return testDb
    .insert(schema.contractors)
    .values({
      businessName: "Existing Business",
      phone: "312-555-0199",
      isUnitContractor: true,
      isBuildingService: false,
      ...overrides,
    })
    .returning()
    .get();
}

function findContractor(id: number) {
  return testDb
    .select()
    .from(schema.contractors)
    .where(eq(schema.contractors.id, id))
    .get();
}

function allContractors() {
  return testDb.select().from(schema.contractors).all();
}

function activity() {
  return testDb.select().from(schema.activityLogs).all();
}

describe("canAddContractors", () => {
  test("admins and owners can add; renters and people without a role can't", () => {
    expect(canAddContractors({ id: "a", role: "admin" })).toBe(true);
    expect(canAddContractors({ id: "o", role: "owner" })).toBe(true);
    expect(canAddContractors({ id: "r", role: "renter" })).toBe(false);
    expect(canAddContractors({ id: "n", role: null })).toBe(false);
    expect(canAddContractors({ id: "u" })).toBe(false);
  });
});

describe("canManageContractor", () => {
  test("admins can manage any listing, including ones with no creator", () => {
    const viewer = { id: "admin-1", role: "admin" };
    expect(canManageContractor(viewer, { createdBy: "someone-else" })).toBe(true);
    expect(canManageContractor(viewer, { createdBy: null })).toBe(true);
  });

  test("owners can manage only the listings they added", () => {
    const viewer = { id: "owner-1", role: "owner" };
    expect(canManageContractor(viewer, { createdBy: "owner-1" })).toBe(true);
    expect(canManageContractor(viewer, { createdBy: "owner-2" })).toBe(false);
  });

  test("owners can't manage listings with no recorded creator", () => {
    expect(
      canManageContractor({ id: "owner-1", role: "owner" }, { createdBy: null }),
    ).toBe(false);
  });

  test("renters can't manage a listing, even one recorded as theirs", () => {
    // A renter can't add a listing, but an owner who later became a renter
    // would still be recorded as the creator of what they added.
    expect(
      canManageContractor({ id: "renter-1", role: "renter" }, { createdBy: "renter-1" }),
    ).toBe(false);
  });

  test("someone without a role can't manage a listing", () => {
    expect(canManageContractor({ id: "x" }, { createdBy: "x" })).toBe(false);
  });
});

describe("Contractors action — adding", () => {
  test("a renter is refused and nothing is saved", async () => {
    signInAs(renter);

    const result = await submit({
      intent: "create",
      ...listingFields(),
      isUnitContractor: "on",
    });

    expect(result).toMatchObject({
      success: false,
      error: expect.stringContaining("Only owners and building administrators"),
    });
    expect(allContractors()).toHaveLength(0);
    expect(activity()).toHaveLength(0);
  });

  test("an owner's listing records them as its creator and is logged under them", async () => {
    signInAs(owner);

    const result = await submit({
      intent: "create",
      ...listingFields(),
      isUnitContractor: "on",
    });

    expect(result).toMatchObject({ success: true });
    const [saved] = allContractors();
    expect(saved.createdBy).toBe(owner.id);
    expect(activity()).toMatchObject([
      {
        userId: owner.id,
        action: "created",
        entityType: "contractor",
        entityId: String(saved.id),
      },
    ]);
  });

  test("an owner can't add a building service provider, even by posting the field", async () => {
    signInAs(owner);

    const result = await submit({
      intent: "create",
      ...listingFields(),
      isBuildingService: "on",
    });

    expect(result).toMatchObject({ success: true });
    const [saved] = allContractors();
    expect(saved.isBuildingService).toBe(false);
    expect(saved.isUnitContractor).toBe(true);
  });

  test("an owner's listing goes in the in-unit list when no list is posted", async () => {
    // The owner's form doesn't show the list checkboxes at all.
    signInAs(owner);

    const result = await submit({ intent: "create", ...listingFields() });

    expect(result).toMatchObject({ success: true });
    expect(allContractors()).toMatchObject([
      { isUnitContractor: true, isBuildingService: false },
    ]);
  });

  test("an admin can add a building service provider", async () => {
    signInAs(admin);

    const result = await submit({
      intent: "create",
      ...listingFields(),
      isBuildingService: "on",
    });

    expect(result).toMatchObject({ success: true });
    expect(allContractors()).toMatchObject([
      { isUnitContractor: false, isBuildingService: true, createdBy: admin.id },
    ]);
  });

  test("an admin still has to pick at least one list", async () => {
    signInAs(admin);

    const result = await submit({ intent: "create", ...listingFields() });

    expect(result).toMatchObject({ success: false });
    expect(allContractors()).toHaveLength(0);
  });
});

describe("Contractors action — editing", () => {
  test("an owner can edit their own listing, and the edit is logged under them", async () => {
    const listing = seedContractor({ createdBy: owner.id });
    signInAs(owner);

    const result = await submit({
      intent: "update",
      recordId: String(listing.id),
      ...listingFields("Renamed Painting"),
    });

    expect(result).toMatchObject({ success: true });
    expect(findContractor(listing.id)?.businessName).toBe("Renamed Painting");
    expect(activity()).toMatchObject([
      { userId: owner.id, action: "updated", entityId: String(listing.id) },
    ]);
  });

  test("an owner can't edit another owner's listing", async () => {
    const listing = seedContractor({ createdBy: otherOwner.id });
    signInAs(owner);

    const result = await submit({
      intent: "update",
      recordId: String(listing.id),
      ...listingFields("Hijacked"),
    });

    expect(result).toMatchObject({
      success: false,
      error: expect.stringContaining("contractors you added yourself"),
    });
    expect(findContractor(listing.id)?.businessName).toBe("Existing Business");
    expect(activity()).toHaveLength(0);
  });

  test("an owner can't edit a listing with no recorded creator", async () => {
    const listing = seedContractor({ createdBy: null });
    signInAs(owner);

    const result = await submit({
      intent: "update",
      recordId: String(listing.id),
      ...listingFields("Hijacked"),
    });

    expect(result).toMatchObject({ success: false });
    expect(findContractor(listing.id)?.businessName).toBe("Existing Business");
  });

  test("a renter can't edit a listing", async () => {
    const listing = seedContractor({ createdBy: owner.id });
    signInAs(renter);

    const result = await submit({
      intent: "update",
      recordId: String(listing.id),
      ...listingFields("Hijacked"),
    });

    expect(result).toMatchObject({ success: false });
    expect(findContractor(listing.id)?.businessName).toBe("Existing Business");
  });

  test("an owner's edit keeps the listing in the lists it's already in", async () => {
    // An admin has also added the owner's listing to the building providers.
    const listing = seedContractor({
      createdBy: owner.id,
      isUnitContractor: true,
      isBuildingService: true,
    });
    signInAs(owner);

    const result = await submit({
      intent: "update",
      recordId: String(listing.id),
      ...listingFields("Renamed Painting"),
      // Neither box posted - the owner's form doesn't show them.
    });

    expect(result).toMatchObject({ success: true });
    expect(findContractor(listing.id)).toMatchObject({
      businessName: "Renamed Painting",
      isUnitContractor: true,
      isBuildingService: true,
    });
  });

  test("an owner can't move their listing into the building providers", async () => {
    const listing = seedContractor({ createdBy: owner.id });
    signInAs(owner);

    await submit({
      intent: "update",
      recordId: String(listing.id),
      ...listingFields(),
      isBuildingService: "on",
    });

    expect(findContractor(listing.id)).toMatchObject({
      isUnitContractor: true,
      isBuildingService: false,
    });
  });

  test("an admin can edit an owner's listing without taking over its ownership", async () => {
    const listing = seedContractor({ createdBy: owner.id });
    signInAs(admin);

    const result = await submit({
      intent: "update",
      recordId: String(listing.id),
      ...listingFields("Admin Edit"),
      isUnitContractor: "on",
      isBuildingService: "on",
    });

    expect(result).toMatchObject({ success: true });
    expect(findContractor(listing.id)).toMatchObject({
      businessName: "Admin Edit",
      isBuildingService: true,
      createdBy: owner.id,
    });
  });
});

describe("Contractors action — removing", () => {
  test("an owner can remove their own listing, and the removal is logged under them", async () => {
    const listing = seedContractor({ createdBy: owner.id });
    signInAs(owner);

    const result = await submit({
      intent: "delete",
      recordId: String(listing.id),
    });

    expect(result).toMatchObject({ success: true });
    expect(findContractor(listing.id)).toBeUndefined();
    expect(activity()).toMatchObject([
      { userId: owner.id, action: "deleted", entityId: String(listing.id) },
    ]);
  });

  test("an owner can't remove another owner's listing", async () => {
    const listing = seedContractor({ createdBy: otherOwner.id });
    signInAs(owner);

    const result = await submit({
      intent: "delete",
      recordId: String(listing.id),
    });

    expect(result).toMatchObject({
      success: false,
      error: expect.stringContaining("contractors you added yourself"),
    });
    expect(findContractor(listing.id)).toBeDefined();
    expect(activity()).toHaveLength(0);
  });

  test("an owner can't remove a listing with no recorded creator", async () => {
    const listing = seedContractor({ createdBy: null });
    signInAs(owner);

    const result = await submit({
      intent: "delete",
      recordId: String(listing.id),
    });

    expect(result).toMatchObject({ success: false });
    expect(findContractor(listing.id)).toBeDefined();
  });

  test("a renter can't remove a listing", async () => {
    const listing = seedContractor({ createdBy: owner.id });
    signInAs(renter);

    const result = await submit({
      intent: "delete",
      recordId: String(listing.id),
    });

    expect(result).toMatchObject({ success: false });
    expect(findContractor(listing.id)).toBeDefined();
  });

  test("an admin can remove any listing", async () => {
    const owned = seedContractor({ createdBy: owner.id });
    const legacy = seedContractor({ createdBy: null });
    signInAs(admin);

    for (const listing of [owned, legacy]) {
      const result = await submit({
        intent: "delete",
        recordId: String(listing.id),
      });
      expect(result).toMatchObject({ success: true });
    }

    expect(allContractors()).toHaveLength(0);
    expect(activity()).toMatchObject([
      { userId: admin.id, action: "deleted" },
      { userId: admin.id, action: "deleted" },
    ]);
  });
});

import { and, asc, eq, inArray } from "drizzle-orm";
import type { AppLoadContext } from "react-router";
import { getDatabase } from "~/util/database.server";
import { createActivityLogData } from "~/util/activityLogger.server";
import {
  type ActionResult,
  actionError,
  actionSuccess,
} from "~/util/crud/actionResult";
import type { AdminActionArgs } from "~/util/crud/adminAction.server";
import * as schema from "../../../database/schema";
import type {
  ContractorListing,
  ContractorPhoto,
  ContractorService,
} from "./types";

type Database = ReturnType<typeof getDatabase>;

export const MAX_PHOTOS_PER_CONTRACTOR = 6;
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/**
 * Loads everything the contractors page needs in four flat queries and stitches
 * the rows together in memory. The building has a handful of vetted
 * contractors, not thousands, so this stays well clear of an N+1 join tangle.
 */
export async function fetchContractorDirectory(db: Database): Promise<{
  contractors: ContractorListing[];
  services: ContractorService[];
}> {
  const [contractorRows, serviceRows, linkRows, photoRows] = await Promise.all([
    db
      .select()
      .from(schema.contractors)
      .orderBy(asc(schema.contractors.businessName))
      .all(),
    db
      .select()
      .from(schema.contractorServices)
      .orderBy(asc(schema.contractorServices.name))
      .all(),
    db.select().from(schema.contractorServiceLinks).all(),
    db
      .select({
        id: schema.contractorPhotos.id,
        contractorId: schema.contractorPhotos.contractorId,
        contentType: schema.contractorPhotos.contentType,
        sortOrder: schema.contractorPhotos.sortOrder,
      })
      .from(schema.contractorPhotos)
      .orderBy(asc(schema.contractorPhotos.sortOrder))
      .all(),
  ]);

  const servicesById = new Map(serviceRows.map((service) => [service.id, service]));

  const servicesByContractor = new Map<number, ContractorService[]>();
  for (const link of linkRows) {
    const service = servicesById.get(link.serviceId);
    if (!service) continue;
    const existing = servicesByContractor.get(link.contractorId) ?? [];
    existing.push({ id: service.id, name: service.name, slug: service.slug });
    servicesByContractor.set(link.contractorId, existing);
  }

  const photosByContractor = new Map<number, ContractorPhoto[]>();
  for (const photo of photoRows) {
    const existing = photosByContractor.get(photo.contractorId) ?? [];
    existing.push({ id: photo.id, contentType: photo.contentType });
    photosByContractor.set(photo.contractorId, existing);
  }

  const contractors = contractorRows.map((contractor) => ({
    id: contractor.id,
    businessName: contractor.businessName,
    contactName: contractor.contactName,
    address: contractor.address,
    latitude: contractor.latitude,
    longitude: contractor.longitude,
    phone: contractor.phone,
    email: contractor.email,
    notes: contractor.notes,
    services: (servicesByContractor.get(contractor.id) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    photos: photosByContractor.get(contractor.id) ?? [],
  }));

  return {
    contractors,
    services: serviceRows.map((service) => ({
      id: service.id,
      name: service.name,
      slug: service.slug,
    })),
  };
}

export function slugifyServiceName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readTrimmed(formData: FormData, field: string): string | null {
  const value = formData.get(field);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

type ContractorInput = {
  businessName: string;
  contactName: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
};

function parseContractorFields(
  formData: FormData,
): { ok: true; value: ContractorInput } | { ok: false; error: string } {
  const businessName = readTrimmed(formData, "businessName");
  const phone = readTrimmed(formData, "phone");
  const email = readTrimmed(formData, "email");

  if (!businessName) {
    return { ok: false, error: "Please enter the business or owner name." };
  }

  if (!phone && !email) {
    return {
      ok: false,
      error:
        "Please add a phone number or an email address so residents can get in touch.",
    };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "That email address doesn't look quite right." };
  }

  return {
    ok: true,
    value: {
      businessName,
      contactName: readTrimmed(formData, "contactName"),
      address: readTrimmed(formData, "address"),
      phone,
      email,
      notes: readTrimmed(formData, "notes"),
    },
  };
}

/**
 * Turns the form's service selection into service ids.
 *
 * `serviceIds` are picks from the existing catalog. `newServices` is a
 * comma-separated list an admin typed in; each one is matched to the catalog by
 * slug first so "AC repair" and "A/C Repair" don't become two entries.
 */
async function resolveServiceIds(
  formData: FormData,
  db: Database,
): Promise<{ ok: true; value: number[] } | { ok: false; error: string }> {
  const selectedIds = formData
    .getAll("serviceIds")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  const newServiceNames = (readTrimmed(formData, "newServices") ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name !== "");

  const resolvedIds = new Set(selectedIds);

  for (const name of newServiceNames) {
    const slug = slugifyServiceName(name);
    if (!slug) continue;

    const existing = await db
      .select()
      .from(schema.contractorServices)
      .where(eq(schema.contractorServices.slug, slug))
      .get();

    if (existing) {
      resolvedIds.add(existing.id);
      continue;
    }

    const created = await db
      .insert(schema.contractorServices)
      .values({ name, slug })
      .returning()
      .get();

    resolvedIds.add(created.id);
  }

  if (resolvedIds.size === 0) {
    return {
      ok: false,
      error:
        "Please choose at least one service. Residents find contractors by the work they need done.",
    };
  }

  return { ok: true, value: Array.from(resolvedIds) };
}

function extensionForPhoto(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  return file.type === "image/png" ? "png" : "jpg";
}

/**
 * Writes the uploaded photos to R2 and records their keys.
 *
 * Photos are always optional, so an upload problem never blocks saving the
 * contractor itself — the caller reports it as a warning instead.
 */
async function savePhotos({
  files,
  contractorId,
  existingPhotoCount,
  context,
  db,
}: {
  files: File[];
  contractorId: number;
  existingPhotoCount: number;
  context: AppLoadContext;
  db: Database;
}): Promise<{ saved: number; warning: string | null }> {
  const usable = files.filter((file) => file instanceof File && file.size > 0);
  if (usable.length === 0) return { saved: 0, warning: null };

  const room = MAX_PHOTOS_PER_CONTRACTOR - existingPhotoCount;
  if (room <= 0) {
    return {
      saved: 0,
      warning: `This listing already has the maximum of ${MAX_PHOTOS_PER_CONTRACTOR} photos, so no new photos were added.`,
    };
  }

  const skipped: string[] = [];
  const accepted: File[] = [];

  for (const file of usable) {
    if (accepted.length >= room) {
      skipped.push(`${file.name} (only ${room} more photo(s) will fit)`);
      continue;
    }
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      skipped.push(`${file.name} (not a JPG, PNG, WEBP or GIF image)`);
      continue;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      skipped.push(
        `${file.name} (larger than ${MAX_PHOTO_SIZE / 1024 / 1024}MB)`,
      );
      continue;
    }
    accepted.push(file);
  }

  let sortOrder = existingPhotoCount;
  for (const file of accepted) {
    const key = `contractors/${contractorId}/${crypto.randomUUID()}.${extensionForPhoto(file)}`;

    await context.cloudflare.env.CONTRACTOR_PHOTOS.put(key, file, {
      httpMetadata: { contentType: file.type },
    });

    await db.insert(schema.contractorPhotos).values({
      contractorId,
      key,
      contentType: file.type,
      sortOrder: sortOrder++,
    });
  }

  return {
    saved: accepted.length,
    warning: skipped.length
      ? `Saved, but these photos were skipped: ${skipped.join("; ")}.`
      : null,
  };
}

async function removePhotos({
  photoIds,
  contractorId,
  context,
  db,
}: {
  photoIds: number[];
  contractorId: number;
  context: AppLoadContext;
  db: Database;
}): Promise<void> {
  if (photoIds.length === 0) return;

  const photos = await db
    .select()
    .from(schema.contractorPhotos)
    .where(
      and(
        eq(schema.contractorPhotos.contractorId, contractorId),
        inArray(schema.contractorPhotos.id, photoIds),
      ),
    )
    .all();

  if (photos.length === 0) return;

  await Promise.all(
    photos.map((photo) =>
      context.cloudflare.env.CONTRACTOR_PHOTOS.delete(photo.key),
    ),
  );

  await db.delete(schema.contractorPhotos).where(
    inArray(
      schema.contractorPhotos.id,
      photos.map((photo) => photo.id),
    ),
  );
}

async function replaceServiceLinks(
  contractorId: number,
  serviceIds: number[],
  db: Database,
): Promise<void> {
  await db
    .delete(schema.contractorServiceLinks)
    .where(eq(schema.contractorServiceLinks.contractorId, contractorId));

  await db
    .insert(schema.contractorServiceLinks)
    .values(serviceIds.map((serviceId) => ({ contractorId, serviceId })));
}

function readPhotoIdsToRemove(formData: FormData): number[] {
  return formData
    .getAll("removePhotoIds")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);
}

export async function createContractor({
  formData,
  db,
  context,
  session,
}: AdminActionArgs): Promise<ActionResult> {
  const fields = parseContractorFields(formData);
  if (!fields.ok) return actionError(fields.error);

  const services = await resolveServiceIds(formData, db);
  if (!services.ok) return actionError(services.error);

  const contractor = await db
    .insert(schema.contractors)
    .values(fields.value)
    .returning()
    .get();

  await replaceServiceLinks(contractor.id, services.value, db);

  const photos = await savePhotos({
    files: formData.getAll("photos") as File[],
    contractorId: contractor.id,
    existingPhotoCount: 0,
    context,
    db,
  });

  await db.insert(schema.activityLogs).values(
    createActivityLogData(
      session.user.id,
      "created",
      "contractor",
      String(contractor.id),
      {
        contractorName: contractor.businessName,
        serviceCount: services.value.length,
        photoCount: photos.saved,
      },
    ),
  );

  return actionSuccess(
    photos.warning
      ? `${contractor.businessName} was added. ${photos.warning}`
      : `${contractor.businessName} was added to the contractor list.`,
  );
}

export async function updateContractor({
  formData,
  db,
  context,
  session,
}: AdminActionArgs): Promise<ActionResult> {
  const contractorId = Number(formData.get("recordId"));
  if (!Number.isInteger(contractorId) || contractorId <= 0) {
    return actionError("We couldn't tell which contractor to update.");
  }

  const existing = await db
    .select()
    .from(schema.contractors)
    .where(eq(schema.contractors.id, contractorId))
    .get();

  if (!existing) {
    return actionError(
      "That contractor no longer exists. Refresh the page to see the current list.",
    );
  }

  const fields = parseContractorFields(formData);
  if (!fields.ok) return actionError(fields.error);

  const services = await resolveServiceIds(formData, db);
  if (!services.ok) return actionError(services.error);

  // Clear the saved map coordinates when the address changes so the Google Maps
  // integration re-geocodes rather than pinning the old location.
  const addressChanged = fields.value.address !== existing.address;

  await db
    .update(schema.contractors)
    .set({
      ...fields.value,
      ...(addressChanged ? { latitude: null, longitude: null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(schema.contractors.id, contractorId));

  await replaceServiceLinks(contractorId, services.value, db);

  await removePhotos({
    photoIds: readPhotoIdsToRemove(formData),
    contractorId,
    context,
    db,
  });

  const remainingPhotos = await db
    .select({ id: schema.contractorPhotos.id })
    .from(schema.contractorPhotos)
    .where(eq(schema.contractorPhotos.contractorId, contractorId))
    .all();

  const photos = await savePhotos({
    files: formData.getAll("photos") as File[],
    contractorId,
    existingPhotoCount: remainingPhotos.length,
    context,
    db,
  });

  await db.insert(schema.activityLogs).values(
    createActivityLogData(
      session.user.id,
      "updated",
      "contractor",
      String(contractorId),
      {
        contractorName: fields.value.businessName,
        serviceCount: services.value.length,
        photoCount: remainingPhotos.length + photos.saved,
      },
    ),
  );

  return actionSuccess(
    photos.warning
      ? `${fields.value.businessName} was updated. ${photos.warning}`
      : `${fields.value.businessName} was updated.`,
  );
}

export async function deleteContractor({
  formData,
  db,
  context,
  session,
}: AdminActionArgs): Promise<ActionResult> {
  const contractorId = Number(formData.get("recordId"));
  if (!Number.isInteger(contractorId) || contractorId <= 0) {
    return actionError("We couldn't tell which contractor to remove.");
  }

  const existing = await db
    .select()
    .from(schema.contractors)
    .where(eq(schema.contractors.id, contractorId))
    .get();

  if (!existing) {
    return actionError(
      "That contractor has already been removed. Refresh the page to see the current list.",
    );
  }

  const photos = await db
    .select()
    .from(schema.contractorPhotos)
    .where(eq(schema.contractorPhotos.contractorId, contractorId))
    .all();

  await Promise.all(
    photos.map((photo) =>
      context.cloudflare.env.CONTRACTOR_PHOTOS.delete(photo.key),
    ),
  );

  // Deleted explicitly rather than relying on cascade so the R2 objects and the
  // rows that point at them always disappear together.
  await db
    .delete(schema.contractorPhotos)
    .where(eq(schema.contractorPhotos.contractorId, contractorId));
  await db
    .delete(schema.contractorServiceLinks)
    .where(eq(schema.contractorServiceLinks.contractorId, contractorId));
  await db
    .delete(schema.contractors)
    .where(eq(schema.contractors.id, contractorId));

  await db.insert(schema.activityLogs).values(
    createActivityLogData(
      session.user.id,
      "deleted",
      "contractor",
      String(contractorId),
      {
        contractorName: existing.businessName,
        photoCount: photos.length,
      },
    ),
  );

  return actionSuccess(
    `${existing.businessName} was removed from the contractor list.`,
  );
}

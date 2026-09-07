import { eq } from "drizzle-orm";
import type { Route } from "./+types/contractorPhoto";
import { isAuthenticated } from "~/util/authHelpers.server";
import { getDatabase } from "~/util/database.server";
import * as schema from "../../database/schema";

/**
 * Streams a contractor photo out of R2.
 *
 * Photos are looked up by their database id rather than by an R2 key supplied in
 * the URL, so a signed-in person can only ever fetch objects the app actually
 * recorded — no poking around the bucket by guessing keys.
 */
export async function loader({ request, context }: Route.LoaderArgs) {
  await isAuthenticated(request, context);

  const url = new URL(request.url);
  const photoId = Number(url.searchParams.get("id"));

  if (!Number.isInteger(photoId) || photoId <= 0) {
    throw new Response("Missing photo id", { status: 400 });
  }

  const db = getDatabase(context);
  const photo = await db
    .select()
    .from(schema.contractorPhotos)
    .where(eq(schema.contractorPhotos.id, photoId))
    .get();

  if (!photo) {
    throw new Response("Photo not found", { status: 404 });
  }

  const object = await context.cloudflare.env.CONTRACTOR_PHOTOS.get(photo.key);

  if (!object) {
    throw new Response("Photo not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("content-type", photo.contentType ?? "application/octet-stream");
  // Photo bytes never change for a given id - a new upload gets a new id
  headers.set("cache-control", "private, max-age=31536000, immutable");

  return new Response(object.body, { headers });
}


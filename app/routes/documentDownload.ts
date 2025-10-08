import type { Route } from "./+types/documentDownload";
import { isAuthenticated } from "~/util/authHelpers.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  await isAuthenticated(request, context);

  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key) {
    throw new Response("Missing file key", { status: 400 });
  }

  console.log("KEY", key);
  const object = await context.cloudflare.env.DOCUMENTS.get(key);
  if (!object) {
    throw new Response("File not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  const filename = key.split("/").pop() || "download";
  headers.set(
    "Content-Disposition",
    `attachment; filename="${decodeURIComponent(filename)}"`,
  );

  return new Response(object.body, {
    headers,
  });
}

import type { AppLoadContext } from "react-router";

/**
 * The Google Maps browser key, when one has been configured.
 *
 * Set `GOOGLE_MAPS_API_KEY` in `.dev.vars` for local development and as a
 * Worker secret for production (`wrangler secret put GOOGLE_MAPS_API_KEY`).
 * Until then this returns null and the map area shows a friendly placeholder
 * instead of a broken embed.
 *
 * The key is a browser key and is meant to be visible to the client. Lock it
 * down in the Google Cloud console with an HTTP referrer restriction for
 * skybox-lofts.com rather than trying to hide it.
 */
export function getGoogleMapsApiKey(context: AppLoadContext): string | null {
  const env = context.cloudflare.env as unknown as {
    GOOGLE_MAPS_API_KEY?: string;
  };

  const key = env.GOOGLE_MAPS_API_KEY?.trim();
  return key ? key : null;
}

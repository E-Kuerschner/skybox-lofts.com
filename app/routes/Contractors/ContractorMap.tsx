import { ExternalLinkIcon, MapPinIcon } from "lucide-react";
import { cn } from "~/util/ui/utils";
import type { ContractorListing } from "./types";

/** Opens an address in Google Maps. Works for everyone, no API key needed. */
export function googleMapsLinkFor(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/**
 * Directory-level map panel.
 *
 * TODO(google-maps): the browser key is not available yet, so this renders a
 * placeholder that keeps the layout honest. When `GOOGLE_MAPS_API_KEY` is set
 * (see `app/util/googleMaps.server.ts`) the work left to do is:
 *   1. Load the Maps JavaScript API once, client side only, in a `useEffect`.
 *   2. Drop a marker for every contractor that has `latitude`/`longitude`, and
 *      fit the map bounds to them plus the building.
 *   3. Geocode on save in `contractors.server.ts` so those two columns get
 *      filled in — they are deliberately cleared whenever an address changes.
 *   4. Clicking a marker should select that contractor in the list below.
 * Everything below the placeholder branch already receives the data it needs.
 */
export function ContractorMap({
  contractors,
  apiKey,
  className,
}: {
  contractors: ContractorListing[];
  apiKey: string | null;
  className?: string;
}) {
  const mappable = contractors.filter((contractor) => contractor.address);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border bg-white shadow-md",
        className,
      )}
      aria-label="Contractor locations"
    >
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <MapPinIcon className="size-4 text-emerald-700" />
        <h2 className="font-semibold">Where they are</h2>
      </div>

      <div className="relative flex min-h-56 flex-col items-center justify-center gap-2 bg-[repeating-linear-gradient(45deg,var(--color-muted),var(--color-muted)_12px,transparent_12px,transparent_24px)] p-6 text-center">
        <MapPinIcon className="size-7 text-muted-foreground" />
        <p className="font-medium">The map is on its way</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {mappable.length > 0
            ? `We'll show all ${mappable.length} contractor ${mappable.length === 1 ? "address" : "addresses"} on a map here soon. In the meantime, every listing has a link that opens its address in Google Maps.`
            : "Once contractors with addresses are added, we'll show them on a map here."}
        </p>
        {apiKey && (
          <p className="text-xs text-muted-foreground">
            Map key configured — the interactive map will appear here.
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * The per-contractor map slot inside the detail view.
 *
 * With a key configured this shows the Google Maps Embed API iframe. Without
 * one it falls back to a plain link, which needs no key and works today.
 */
export function ContractorMapPreview({
  address,
  businessName,
  apiKey,
}: {
  address: string;
  businessName: string;
  apiKey: string | null;
}) {
  if (!apiKey) {
    return (
      <a
        href={googleMapsLinkFor(address)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:underline"
      >
        <ExternalLinkIcon className="size-3.5" />
        Open this address in Google Maps
      </a>
    );
  }

  return (
    <iframe
      title={`Map showing ${businessName}`}
      className="h-52 w-full rounded-lg border"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={`https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(address)}`}
    />
  );
}

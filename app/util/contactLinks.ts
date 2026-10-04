export type ContactKind = "phone" | "email" | "website" | "address";

/**
 * The link that calls a number, starts an email, opens a website, or shows an
 * address on Google Maps.
 */
export function contactHref(kind: ContactKind, value: string): string {
  switch (kind) {
    case "phone":
      return `tel:${value.replace(/[^\d+]/g, "")}`;
    case "email":
      return `mailto:${value}`;
    case "website":
      return value;
    case "address":
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
  }
}

/** Links that leave the app open in a new tab rather than replacing it. */
export function opensNewTab(kind: ContactKind): boolean {
  return kind === "website" || kind === "address";
}

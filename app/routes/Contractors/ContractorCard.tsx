import {
  GlobeIcon,
  ImageIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { AdminItemActions } from "~/components/AdminOnly";
import { contractorPhotoUrl } from "~/util/contractorPhotoUrl";
import { cn } from "~/util/ui/utils";
import { ServiceBadges } from "./ServiceFilterChips";
import type { ContractorListing } from "./types";

/**
 * Floor height for a card, shared with the empty state that stands in for the
 * grid. Filtering down to no results then collapses the section by one row
 * rather than snapping the whole page upward.
 *
 * Sized to a card carrying a photo header - the tallest of the two shapes - so
 * the reserved space covers the worst case rather than the compact one.
 * That's the 128px photo band (`h-32`, below) plus the name and contact block
 * beneath it.
 */
export const CONTRACTOR_CARD_MIN_HEIGHT = "min-h-52";

export function ContractorCard({
  contractor,
  showPhoto = true,
  onOpenDetails,
  onEdit,
  onDelete,
}: {
  contractor: ContractorListing;
  /**
   * Building service listings never have photos, so their cards skip the
   * placeholder rather than stacking two dozen empty grey boxes down the page.
   */
  showPhoto?: boolean;
  onOpenDetails: (contractor: ContractorListing) => void;
  onEdit: (contractor: ContractorListing) => void;
  onDelete: (contractor: ContractorListing) => void;
}) {
  const coverPhoto = contractor.photos[0];

  return (
    <article className={cn(
      "group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-stone-100 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      CONTRACTOR_CARD_MIN_HEIGHT,
    )}>
      {/* Everything above the admin controls. Being the positioned, clipping
          box is what stops the note sliding over the Edit/Remove row - it
          rises to the top of those controls instead. With no controls (what a
          resident sees) this is the whole card, so it rises from the bottom. */}
      <div className="relative flex grow flex-col overflow-hidden">
        {/* The hit area for opening the details view is the whole card body,
            not just the heading. It sits above the static content but below
            the links, which carry `relative z-10` to keep their own targets. */}
        <button
          type="button"
          onClick={() => onOpenDetails(contractor)}
          className="absolute inset-0 cursor-pointer"
          aria-label={`See details for ${contractor.businessName}`}
        />

        <div className="flex flex-col items-stretch text-left">
          {(showPhoto || coverPhoto) && (
            <div
              className={cn(
                "flex h-32 items-center justify-center bg-stone-200",
                !coverPhoto && "text-muted-foreground",
              )}
            >
              {coverPhoto ? (
                <img
                  src={contractorPhotoUrl(coverPhoto.id)}
                  alt={`Work by ${contractor.businessName}`}
                  loading="lazy"
                  className="h-32 w-full object-cover"
                />
              ) : (
                <ImageIcon className="size-6" />
              )}
            </div>
          )}

          <div className="px-4 pt-3">
            <h3 className="font-semibold leading-snug">
              {contractor.businessName}
            </h3>
            {contractor.contactName && (
              <p className="text-sm text-muted-foreground">
                {contractor.contactName}
              </p>
            )}
          </div>
        </div>

        <div className="flex grow flex-col gap-3 px-4 pb-4 pt-3">
          <ServiceBadges services={contractor.services} />

          <div className="mt-auto space-y-1.5 text-sm">
            {contractor.phone && (
              <a
                href={`tel:${contractor.phone.replace(/[^\d+]/g, "")}`}
                className="relative z-10 flex w-fit max-w-full items-center gap-2 text-emerald-700 hover:underline"
              >
                <PhoneIcon className="size-3.5 shrink-0" />
                {contractor.phone}
              </a>
            )}
            {contractor.email && (
              <a
                href={`mailto:${contractor.email}`}
                className="relative z-10 flex w-fit max-w-full items-center gap-2 text-emerald-700 hover:underline"
              >
                <MailIcon className="size-3.5 shrink-0" />
                <span className="truncate">{contractor.email}</span>
              </a>
            )}
            {contractor.website && (
              <a
                href={contractor.website}
                target="_blank"
                rel="noreferrer"
                className="relative z-10 flex w-fit max-w-full items-center gap-2 text-emerald-700 hover:underline"
              >
                <GlobeIcon className="size-3.5 shrink-0" />
                <span className="truncate">{contractor.website}</span>
              </a>
            )}
            {contractor.address && (
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPinIcon className="mt-0.5 size-3.5 shrink-0" />
                <span>{contractor.address}</span>
              </p>
            )}
          </div>
        </div>

        {/* `pointer-events-none` keeps the panel from stealing the hover that
            summoned it, and leaves the contact links underneath clickable. */}
        {contractor.notes && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-full bg-stone-900/80 px-4 py-3 opacity-0 backdrop-blur-sm transition duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none">
            <p className="line-clamp-3 text-xs leading-relaxed text-white">
              {contractor.notes}
            </p>
          </div>
        )}
      </div>

      <AdminItemActions className="mx-4 mb-4">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(contractor)}
        >
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(contractor)}
        >
          Remove
        </Button>
      </AdminItemActions>
    </article>
  );
}

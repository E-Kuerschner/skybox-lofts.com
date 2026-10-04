import { ImageIcon } from "lucide-react";
import { Card } from "~/components/ui/card";
import { contactHref } from "~/util/contactLinks";
import { contractorPhotoUrl } from "~/util/contractorPhotoUrl";
import { ContractorAdminActions } from "./ContractorAdminActions";
import { otherJobs, type ListingHandlers } from "./directory";
import type { ContractorListing } from "./types";

const contactLinkClass = "relative z-10 text-emerald-700 hover:underline";

/** A contractor as listed under one job on the desktop page. */
export function ContractorJobCard({
  contractor,
  underSlug,
  showPhoto = true,
  onOpenDetails,
  onEdit,
  onDelete,
}: ListingHandlers & {
  contractor: ContractorListing;
  /** The job heading this card sits under; the card names the other jobs. */
  underSlug: string;
  /**
   * Building vendors never have photos, so their cards skip the thumbnail
   * rather than repeating an empty box down the page.
   */
  showPhoto?: boolean;
}) {
  const coverPhoto = contractor.photos[0];
  const alsoDoes = otherJobs(contractor, underSlug);

  return (
    <Card className="relative flex flex-row gap-3.5 p-3.5 shadow-xs transition-shadow hover:shadow-sm">
      {/* The whole card opens the details; links and admin buttons sit above. */}
      <button
        type="button"
        onClick={() => onOpenDetails(contractor)}
        className="absolute inset-0 cursor-pointer rounded-xl"
        aria-label={`See details for ${contractor.businessName}`}
      />

      {showPhoto && (
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
          {coverPhoto ? (
            <img
              src={contractorPhotoUrl(coverPhoto.id)}
              alt={`Work by ${contractor.businessName}`}
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <ImageIcon className="size-5" />
          )}
        </div>
      )}

      <div className="flex min-w-0 grow flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold leading-snug">
            {contractor.businessName}
          </h4>
          <ContractorAdminActions
            variant="icons"
            contractor={contractor}
            onEdit={onEdit}
            onDelete={onDelete}
            className="-mt-1.5 -mr-1.5"
          />
        </div>
        {alsoDoes && (
          <p className="text-sm text-muted-foreground">
            {alsoDoes}
          </p>
        )}
        {contractor.notes && (
          <p className="line-clamp-2 text-sm text-foreground/75">
            {contractor.notes}
          </p>
        )}

        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
          {contractor.phone && (
            <a href={contactHref("phone", contractor.phone)} className={contactLinkClass}>
              {contractor.phone}
            </a>
          )}
          {contractor.email && (
            <a href={contactHref("email", contractor.email)} className={contactLinkClass}>
              Email
            </a>
          )}
          {contractor.website && (
            <a
              href={contractor.website}
              target="_blank"
              rel="noreferrer"
              className={contactLinkClass}
            >
              Website
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}

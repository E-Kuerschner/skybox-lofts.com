import { ContactButton } from "~/components/ContactButton";
import { ContractorAdminActions } from "./ContractorAdminActions";
import { otherJobs } from "./directory";
import type { ContractorListing } from "./types";

/**
 * A contractor as listed under one job on a phone: the details on the left,
 * email and call one tap away on the right.
 */
export function ContractorJobRow({
  contractor,
  underSlug,
  onOpenDetails,
  onEdit,
  onDelete,
}: {
  contractor: ContractorListing;
  underSlug: string;
  onOpenDetails: (contractor: ContractorListing) => void;
  onEdit: (contractor: ContractorListing) => void;
  onDelete: (contractor: ContractorListing) => void;
}) {
  const alsoDoes = otherJobs(contractor, underSlug);

  return (
    <li className="border-b px-3.5 py-3 last:border-b-0">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onOpenDetails(contractor)}
          className="flex min-w-0 grow cursor-pointer flex-col gap-0.5 text-left"
        >
          <span className="font-semibold leading-snug">
            {contractor.businessName}
          </span>
          {alsoDoes && (
            <span className="text-sm text-muted-foreground">{alsoDoes}</span>
          )}
          {contractor.notes && (
            <span className="line-clamp-2 text-sm text-foreground/80">
              {contractor.notes}
            </span>
          )}
        </button>

        {/* A fixed-width slot per action keeps the call buttons lined up
            down the list, whether or not a business has an email. */}
        <div className="flex shrink-0 gap-2">
          {contractor.email ? (
            <ContactButton
              kind="email"
              value={contractor.email}
              name={contractor.businessName}
            />
          ) : (
            <span aria-hidden className="size-11" />
          )}
          {contractor.phone && (
            <ContactButton
              kind="phone"
              value={contractor.phone}
              name={contractor.businessName}
            />
          )}
        </div>
      </div>

      <ContractorAdminActions
        contractor={contractor}
        onEdit={onEdit}
        onDelete={onDelete}
        className="mt-3"
      />
    </li>
  );
}

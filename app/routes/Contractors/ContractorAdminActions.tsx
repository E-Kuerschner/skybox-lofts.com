import { PencilIcon, Trash2Icon } from "lucide-react";
import { AdminOnly } from "~/components/AdminOnly";
import { IconButton } from "~/components/IconButton";
import { cn } from "~/util/ui/utils";
import type { ContractorListing } from "./types";

type ContractorAdminActionsProps = {
  contractor: ContractorListing;
  onEdit: (contractor: ContractorListing) => void;
  onDelete: (contractor: ContractorListing) => void;
  className?: string;
};

/**
 * Edit and Remove for one listing as two small icon buttons in a card's
 * corner, shown only to board admins.
 *
 * Carries `relative z-10` so it stays clickable above a card's open-details
 * hit area.
 */
export function ContractorAdminActions({
  contractor,
  onEdit,
  onDelete,
  className,
}: ContractorAdminActionsProps) {
  return (
    <AdminOnly>
      <div className={cn("relative z-10 flex gap-1", className)}>
        <IconButton
          icon={PencilIcon}
          label={`Edit ${contractor.businessName}`}
          onClick={() => onEdit(contractor)}
        />
        <IconButton
          icon={Trash2Icon}
          tone="destructive"
          label={`Remove ${contractor.businessName}`}
          onClick={() => onDelete(contractor)}
        />
      </div>
    </AdminOnly>
  );
}

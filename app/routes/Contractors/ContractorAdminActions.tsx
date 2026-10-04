import { PencilIcon, Trash2Icon } from "lucide-react";
import { AdminItemActions, AdminOnly } from "~/components/AdminOnly";
import { IconButton } from "~/components/IconButton";
import { Button } from "~/components/ui/button";
import { cn } from "~/util/ui/utils";
import type { ContractorListing } from "./types";

type ContractorAdminActionsProps = {
  contractor: ContractorListing;
  onEdit: (contractor: ContractorListing) => void;
  onDelete: (contractor: ContractorListing) => void;
  /**
   * `row`: labelled buttons in their own separated row, for list rows.
   * `icons`: two small icon buttons, for a card's corner.
   */
  variant?: "row" | "icons";
  className?: string;
};

/**
 * Edit and Remove for one listing, shown only to board admins.
 *
 * Carries `relative z-10` so it stays clickable above a card's open-details
 * hit area.
 */
export function ContractorAdminActions({
  contractor,
  onEdit,
  onDelete,
  variant = "row",
  className,
}: ContractorAdminActionsProps) {
  if (variant === "icons") {
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

  return (
    <AdminItemActions className={cn("relative z-10", className)}>
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
  );
}

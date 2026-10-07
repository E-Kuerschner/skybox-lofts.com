import { PencilIcon, Trash2Icon } from "lucide-react";
import { IconButton } from "~/components/IconButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { AccessStatus } from "./AccessStatus";
import { whyNotRemovable, type Resident } from "./types";

/**
 * The residents as a table, for larger screens: one white surface sitting on
 * the page, with a row per person. Clicking a row opens their details; Edit
 * and Remove sit at the end of the row.
 */
export function ResidentTable({
  residents,
  onOpenDetails,
  onEdit,
  onRemove,
}: {
  residents: Resident[];
  onOpenDetails: (resident: Resident) => void;
  onEdit: (resident: Resident) => void;
  onRemove: (resident: Resident) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <Table className="min-w-[760px]">
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="px-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Name
            </TableHead>
            <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Unit
            </TableHead>
            <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Role
            </TableHead>
            <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Board
            </TableHead>
            <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Website access
            </TableHead>
            <TableHead className="px-5">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {residents.map((resident) => {
            const name = resident.name || "Unnamed resident";
            const blockedReason = whyNotRemovable(resident);

            return (
              <TableRow
                key={resident.id}
                onClick={() => onOpenDetails(resident)}
                className="cursor-pointer"
              >
                <TableCell className="px-5 py-3.5">
                  {/* The row is clickable with a mouse; this button is the
                      keyboard and screen reader way in. */}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenDetails(resident);
                    }}
                    className="cursor-pointer text-left font-medium text-foreground hover:underline"
                  >
                    {name}
                  </button>
                  <div className="text-[13px] text-muted-foreground">
                    {resident.email}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3.5 tabular-nums">
                  {resident.unitNumber ?? "—"}
                </TableCell>
                <TableCell className="px-4 py-3.5 capitalize">
                  {resident.role || "—"}
                </TableCell>
                <TableCell className="px-4 py-3.5 text-muted-foreground">
                  {resident.boardPosition ?? "—"}
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <AccessStatus resident={resident} />
                </TableCell>
                <TableCell
                  className="px-5 py-2.5 text-right"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-1">
                    <IconButton
                      icon={PencilIcon}
                      label={`Edit ${name}`}
                      onClick={() => onEdit(resident)}
                    />
                    {/* A disabled button shows no tooltip, so the reason sits
                        on a wrapper instead. */}
                    <span title={blockedReason ?? undefined}>
                      <IconButton
                        icon={Trash2Icon}
                        tone="destructive"
                        label={blockedReason ?? `Remove ${name}`}
                        disabled={blockedReason !== null}
                        onClick={() => onRemove(resident)}
                      />
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

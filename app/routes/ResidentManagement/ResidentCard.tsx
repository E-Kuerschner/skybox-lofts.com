import { ChevronRightIcon } from "lucide-react";
import type { Resident } from "./types";

/** One resident in the list. Tapping it opens their details. */
export function ResidentCard({
  user,
  onOpenDetails,
}: {
  user: Resident;
  onOpenDetails: (user: Resident) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenDetails(user)}
      className="flex w-full cursor-pointer items-center justify-between bg-card border rounded-lg px-4 py-3 text-left hover:bg-muted/50 transition-colors shadow-sm"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="font-medium text-foreground truncate">
            {user.name || "Unnamed User"}
          </h3>
          {user.emailVerified ? (
            <span className="text-xs text-positive-foreground shrink-0">
              Verified
            </span>
          ) : (
            <span className="text-xs text-warning-foreground shrink-0">
              Pending
            </span>
          )}
          {user.isBoardMember && user.boardPosition && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
              Board: {user.boardPosition}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          <span className="text-xs text-muted-foreground shrink-0">
            • Unit {user.unitNumber ?? 0}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        <span className="text-sm text-muted-foreground capitalize hidden sm:inline">
          {user.role || ""}
        </span>
        <ChevronRightIcon className="size-4 text-muted-foreground" />
      </div>
    </button>
  );
}

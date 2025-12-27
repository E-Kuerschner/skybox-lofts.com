import { Form } from "react-router";
import { Trash2Icon } from "lucide-react";
import { Button } from "~/components/ui/button";

type ResidentCardProps = {
  user: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string;
    unitNumber: number | null;
    role: string | null;
    emailVerified: boolean;
    isBoardMember?: boolean;
    boardPosition?: string | null;
  };
  isAdmin: boolean;
  onEdit?: (user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    unitNumber: number | null;
    role: string | null;
  }) => void;
};

export function ResidentCard({ user, isAdmin, onEdit }: ResidentCardProps) {
  const canDelete = isAdmin && user.role !== "admin";

  return (
    <div className="flex items-center justify-between bg-card border rounded-lg px-4 py-3 hover:bg-muted/50 transition-colors shadow-sm">
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onEdit?.(user)}
      >
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="font-medium text-foreground truncate">
            {user.name || "Unnamed User"}
          </h3>
          {user.emailVerified ? (
            <span className="text-xs text-emerald-600 shrink-0">Verified</span>
          ) : (
            <span className="text-xs text-muted-foreground shrink-0">
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
        {canDelete ? (
          <Form method="post">
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="userId" value={user.id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="hover:text-destructive"
              onClick={(e) => {
                if (
                  !confirm(
                    `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </Form>
        ) : (
          isAdmin && (
            <div className="w-10 flex items-center justify-center">
              <span className="text-sm text-muted-foreground">—</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

import { useRouteLoaderData } from "react-router";
import { cn } from "~/util/ui/utils";

type ResidentLayoutData = {
  userName: string | null;
  isAdmin: boolean;
};

/**
 * Whether the signed-in person is a building administrator.
 *
 * Read from the resident layout's loader so individual pages don't each have to
 * re-derive it, and so a page's own loader data stays about the page's subject.
 */
export function useIsAdmin(): boolean {
  const layoutData = useRouteLoaderData("routes/ResidentLayout") as
    | ResidentLayoutData
    | undefined;

  return layoutData?.isAdmin === true;
}

/**
 * Shows its children only to a building administrator.
 *
 * There is no edit mode to enter first. Admin controls are simply present,
 * attached to the thing they act on — see `docs/admin-crud-pattern.md` for why
 * a page-wide mode was rejected. The server re-checks the role on every submit;
 * this only decides what is worth showing.
 */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  return useIsAdmin() ? <>{children}</> : null;
}

/**
 * The standard place an item's admin controls live: a quiet row at the end of a
 * card, or a trailing cell in a table row.
 *
 * Keeping them in their own separated area is what lets them stay permanently
 * visible without competing with the item's own content, and keeps a
 * destructive control from sitting a thumb-width from something a resident taps
 * on purpose.
 */
export function AdminItemActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AdminOnly>
      <div className={cn("flex gap-2 border-t pt-3", className)}>
        {children}
      </div>
    </AdminOnly>
  );
}

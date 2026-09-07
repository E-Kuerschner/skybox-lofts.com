import { createContext, useContext, useMemo, useState } from "react";
import { useRouteLoaderData } from "react-router";
import { Edit3Icon } from "lucide-react";
import { Button } from "~/components/ui/button";

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

type AdminEditingValue = {
  isAdmin: boolean;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
};

const AdminEditingContext = createContext<AdminEditingValue>({
  isAdmin: false,
  isEditing: false,
  setIsEditing: () => {},
});

/**
 * Wraps a page that has admin-only create/update/delete controls.
 *
 * The convention: residents always see a clean, read-only page. An admin sees a
 * single "Make changes" button, and only after pressing it do the edit and
 * delete controls appear. One switch to find, one mental model on every page,
 * and no chance of an admin deleting something by mis-tapping while browsing.
 */
export function AdminEditingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = useIsAdmin();
  const [isEditing, setIsEditing] = useState(false);

  const value = useMemo(
    () => ({
      isAdmin,
      // A non-admin can never be in editing mode, whatever the local state says
      isEditing: isAdmin && isEditing,
      setIsEditing,
    }),
    [isAdmin, isEditing],
  );

  return (
    <AdminEditingContext.Provider value={value}>
      {children}
    </AdminEditingContext.Provider>
  );
}

export function useAdminEditing(): AdminEditingValue {
  return useContext(AdminEditingContext);
}

/**
 * The standard entry point into edit mode. Renders nothing for residents.
 */
export function AdminEditToggle({
  className,
  startLabel = "Make changes",
  doneLabel = "Done",
}: {
  className?: string;
  startLabel?: string;
  doneLabel?: string;
}) {
  const { isAdmin, isEditing, setIsEditing } = useAdminEditing();

  if (!isAdmin) return null;

  return (
    <Button
      className={className}
      variant={isEditing ? "outline" : "secondary"}
      onClick={() => setIsEditing(!isEditing)}
      aria-pressed={isEditing}
    >
      {isEditing ? (
        doneLabel
      ) : (
        <>
          <Edit3Icon className="size-4 mr-2" />
          {startLabel}
        </>
      )}
    </Button>
  );
}

/**
 * Shows its children only to an admin who has entered edit mode.
 *
 * Pass `alwaysVisibleToAdmins` for controls that make sense outside edit mode
 * (rare — prefer keeping everything behind the toggle).
 */
export function AdminOnly({
  children,
  alwaysVisibleToAdmins = false,
}: {
  children: React.ReactNode;
  alwaysVisibleToAdmins?: boolean;
}) {
  const { isAdmin, isEditing } = useAdminEditing();

  if (!isAdmin) return null;
  if (!isEditing && !alwaysVisibleToAdmins) return null;

  return <>{children}</>;
}

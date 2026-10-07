import type { Route } from "./+types/index";
import { eq } from "drizzle-orm";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeftIcon, UserPlusIcon } from "lucide-react";
import { Form, useNavigation } from "react-router";
import { getAuth } from "~/auth";
import { getDatabase } from "~/util/database.server";
import { isAdmin } from "~/util/authHelpers.server";
import { sendInviteEmail } from "~/email/sendInviteEmail.server";
import { ActionButton } from "~/components/ActionButton";
import { Button } from "~/components/ui/button";
import { FilterChips } from "~/components/FilterChips";
import { NoContent } from "~/components/NoContent";
import { SearchInput } from "~/components/SearchInput";
import {
  OverlayBody,
  OverlayFooter,
  ResponsiveOverlay,
} from "~/components/ResponsiveOverlay";
import { fuzzyMatch } from "~/util/fuzzySearch";
import { createActivityLogData } from "~/util/activityLogger.server";
import { StatusBanner } from "~/components/StatusBanner";
import { useStatusBanner } from "~/components/crud/ActionStatusBanner";
import { ConfirmActionDialog } from "~/components/crud/ConfirmActionDialog";
import { CRUD_RECORD_ID_FIELD } from "~/components/crud/CrudFormDialog";
import * as schema from "../../../database/schema";
import { ResidentDetail } from "./ResidentDetail";
import { ResidentForm } from "./ResidentForm";
import { ResidentList } from "./ResidentList";
import { ResidentTable } from "./ResidentTable";
import { PendingInvitesBanner } from "./PendingInvitesBanner";
import type { Resident } from "./types";

type ResidentFilter = "all" | "owner" | "renter" | "pending";

/** The chips above the list, each with the residents it keeps. */
const RESIDENT_FILTERS: {
  value: ResidentFilter;
  label: string;
  matches: (resident: Resident) => boolean;
}[] = [
  { value: "all", label: "All", matches: () => true },
  { value: "owner", label: "Owners", matches: (r) => r.role === "owner" },
  { value: "renter", label: "Renters", matches: (r) => r.role === "renter" },
  {
    value: "pending",
    label: "Invite pending",
    matches: (r) => !r.emailVerified,
  },
];

export async function loader({ request, context }: Route.LoaderArgs) {
  await isAdmin(request, context);

  const db = getDatabase(context);

  // Fetch all users with their board positions in a single query using LEFT JOIN
  const usersWithBoardInfo = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
      email: schema.users.email,
      emailVerified: schema.users.emailVerified,
      unitNumber: schema.users.unitNumber,
      role: schema.users.role,
      isAnonymous: schema.users.isAnonymous,
      createdAt: schema.users.createdAt,
      updatedAt: schema.users.updatedAt,
      boardPosition: schema.boardMembers.role,
    })
    .from(schema.users)
    .leftJoin(
      schema.boardMembers,
      eq(schema.users.id, schema.boardMembers.userId),
    )
    .where(eq(schema.users.isAnonymous, false))
    .all()
    .then((results) =>
      results.map((row) => ({
        ...row,
        isBoardMember: row.boardPosition !== null,
      })),
    );

  return { users: usersWithBoardInfo };
}

async function handleDeleteUser(
  userId: string,
  db: ReturnType<typeof getDatabase>,
  auth: ReturnType<typeof getAuth>,
  request: Request,
  actorUserId: string,
) {
  if (!userId) {
    return { success: false, error: "User ID is required" };
  }

  try {
    // Check if user exists and is not an admin
    const userToDelete = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .get();

    if (!userToDelete) {
      return { success: false, error: "User not found" };
    }

    if (userToDelete.role === "admin") {
      return { success: false, error: "Cannot delete admin users" };
    }

    // Check if user is on the board
    const boardPosition = await db
      .select()
      .from(schema.boardMembers)
      .where(eq(schema.boardMembers.userId, userId))
      .get();

    if (boardPosition) {
      return {
        success: false,
        error:
          "Cannot delete user who is on the board. Please remove them from their board position first.",
      };
    }

    // First, revoke all active sessions for the user
    await auth.api.revokeUserSessions({
      headers: request.headers,
      body: { userId },
    });

    // Then, remove the user using Better Auth admin API
    await auth.api.removeUser({
      headers: request.headers,
      body: { userId },
    });

    // Log the activity after user deletion
    await db.insert(schema.activityLogs).values(
      createActivityLogData(actorUserId, "deleted", "resident", userId, {
        residentName: userToDelete.name || undefined,
      }),
    );

    return { success: true, message: "Resident removed" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

async function handleCreateUser(
  firstName: string,
  lastName: string,
  email: string,
  unitNumber: string,
  role: string,
  db: ReturnType<typeof getDatabase>,
  context: Route.ActionArgs["context"],
  actorUserId: string,
) {
  if (!firstName || !lastName || !email || !unitNumber || !role) {
    return {
      error: "First name, last name, email, unit number, and role are required",
    };
  }

  const unitNum = Number(unitNumber);
  if (isNaN(unitNum) || unitNum < 0) {
    return { error: "Unit number must be a non-negative number" };
  }

  // Compute full name for Better Auth compatibility
  const name = `${firstName} ${lastName}`;

  try {
    // Insert new user into database
    const newUser = await db
      .insert(schema.users)
      .values({
        id: crypto.randomUUID(),
        name,
        firstName,
        lastName,
        email,
        unitNumber: unitNum,
        role,
        isAnonymous: false,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .get();

    // Log the activity
    await db.insert(schema.activityLogs).values(
      createActivityLogData(actorUserId, "created", "resident", newUser.id, {
        residentName: name,
        residentEmail: email,
        unitNumber: unitNum,
        role,
      }),
    );

    // Send invite email
    await sendInviteEmail(context.cloudflare.env, email, firstName, name);
    await db.insert(schema.activityLogs).values(
      createActivityLogData(actorUserId, "invited", "resident", newUser.id, {
        residentName: name,
        residentEmail: email,
        unitNumber: unitNum,
      }),
    );

    return { success: true, message: "User created and invitation sent" };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "Failed to create user. Email may already exist." };
  }
}

async function handleUpdateUser(
  userId: string,
  firstName: string,
  lastName: string,
  unitNumber: string,
  role: string,
  db: ReturnType<typeof getDatabase>,
  actorUserId: string,
) {
  if (!userId || !firstName || !lastName || !unitNumber || !role) {
    return {
      error:
        "User ID, first name, last name, unit number, and role are required",
    };
  }

  const unitNum = Number(unitNumber);
  if (isNaN(unitNum) || unitNum < 0) {
    return { error: "Unit number must be a non-negative number" };
  }

  // Compute full name for Better Auth compatibility
  const name = `${firstName} ${lastName}`;

  try {
    // Check if user exists
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .get();

    if (!existingUser) {
      return { error: "User not found" };
    }

    // Update user in database (email is not updated - must use Better Auth APIs)
    await db
      .update(schema.users)
      .set({
        name,
        firstName,
        lastName,
        unitNumber: unitNum,
        role,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    // Log the activity
    await db.insert(schema.activityLogs).values(
      createActivityLogData(actorUserId, "updated", "resident", userId, {
        residentName: name,
        unitNumber: unitNum,
        role,
      }),
    );

    return { success: true, message: "User updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: "Failed to update user" };
  }
}

export async function action({ request, context }: Route.ActionArgs) {
  const session = await isAdmin(request, context, { returnUnauthorized: true });

  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const db = getDatabase(context);
  const auth = getAuth(context);

  if (intent === "delete") {
    // Sent by ConfirmActionDialog, which names the record generically
    const userId = formData.get(CRUD_RECORD_ID_FIELD) as string;
    return handleDeleteUser(userId, db, auth, request, session.user.id);
  }

  if (intent === "create") {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const unitNumber = formData.get("unitNumber") as string;
    const role = formData.get("role") as string;
    return handleCreateUser(
      firstName,
      lastName,
      email,
      unitNumber,
      role,
      db,
      context,
      session.user.id,
    );
  }

  if (intent === "update") {
    const userId = formData.get("userId") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const unitNumber = formData.get("unitNumber") as string;
    const role = formData.get("role") as string;
    return handleUpdateUser(
      userId,
      firstName,
      lastName,
      unitNumber,
      role,
      db,
      session.user.id,
    );
  }

  return { error: "Invalid intent" };
}

export default function ResidentManagement({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserUnitNumber, setNewUserUnitNumber] = useState("");
  const [newUserRole, setNewUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [residentFilter, setResidentFilter] = useState<ResidentFilter>("all");
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  // Whether the edit form was opened from the details view, so it can offer a
  // way back there.
  const [editingFromDetails, setEditingFromDetails] = useState(false);
  const [optimisticUsers, setOptimisticUsers] = useState(loaderData.users);
  const [successKey, setSuccessKey] = useState(0);
  const [detailUser, setDetailUser] = useState<Resident | null>(null);
  const [userToRemove, setUserToRemove] = useState<Resident | null>(null);
  const { banner, showSuccess } = useStatusBanner();

  // Sync optimistic users with loader data
  useEffect(() => {
    if (navigation.state === "idle") {
      setOptimisticUsers(loaderData.users);
    }
  }, [loaderData.users, navigation.state]);

  // Close overlay after successful submission and increment success key
  useEffect(() => {
    if (navigation.state === "idle" && actionData?.success) {
      setIsOverlayOpen(false);
      setSuccessKey((prev) => prev + 1);
    }
  }, [navigation.state, actionData?.success]);

  // Clear form when overlay is closed (delayed to avoid animation issues)
  const handleOverlayOpenChange = (open: boolean) => {
    setIsOverlayOpen(open);
    if (!open) {
      setTimeout(() => {
        setNewUserFirstName("");
        setNewUserLastName("");
        setNewUserEmail("");
        setNewUserUnitNumber("");
        setNewUserRole("");
        setEditingUserId(null);
      }, 150);
    }
  };

  // Handle edit user
  const handleEditUser = (user: Resident, fromDetails = false) => {
    setDetailUser(null);
    setEditingFromDetails(fromDetails);
    setEditingUserId(user.id);
    setNewUserFirstName(user.firstName || "");
    setNewUserLastName(user.lastName || "");
    setNewUserEmail(user.email);
    setNewUserUnitNumber(user.unitNumber?.toString() || "");
    setNewUserRole(user.role || "");
    setIsOverlayOpen(true);
  };

  // Handle new user
  const handleNewUser = () => {
    setEditingUserId(null);
    setNewUserFirstName("");
    setNewUserLastName("");
    setNewUserEmail("");
    setNewUserUnitNumber("");
    setNewUserRole("");
    setIsOverlayOpen(true);
  };

  const editingUser =
    optimisticUsers.find((user) => user.id === editingUserId) ?? null;

  const isFormValid = Boolean(
    newUserFirstName.trim() &&
      newUserLastName.trim() &&
      newUserEmail.trim() &&
      newUserUnitNumber.trim() &&
      !isNaN(Number(newUserUnitNumber)) &&
      Number(newUserUnitNumber) >= 0 &&
      newUserRole,
  );

  // Apply optimistic update when submitting
  useEffect(() => {
    if (navigation.state === "submitting" && navigation.formData) {
      const intent = navigation.formData.get("intent");
      const userId = navigation.formData.get("userId") as string;
      const firstName = navigation.formData.get("firstName") as string;
      const lastName = navigation.formData.get("lastName") as string;
      const unitNumber = navigation.formData.get("unitNumber") as string;
      const role = navigation.formData.get("role") as string;

      if (intent === "update" && userId) {
        // Optimistically update the user (email is not updated)
        setOptimisticUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  name: `${firstName} ${lastName}`,
                  firstName,
                  lastName,
                  unitNumber: Number(unitNumber),
                  role,
                  updatedAt: new Date(),
                }
              : user,
          ),
        );
      } else if (intent === "delete" && userId) {
        // Optimistically delete the user
        setOptimisticUsers((prev) => prev.filter((user) => user.id !== userId));
      }
    }
  }, [navigation.state, navigation.formData]);

  // Revert optimistic updates on error
  useEffect(() => {
    if (actionData?.error && navigation.state === "idle") {
      setOptimisticUsers(loaderData.users);
    }
  }, [actionData?.error, loaderData.users, navigation.state]);

  const pendingUsers = useMemo(
    () => optimisticUsers.filter((user) => !user.emailVerified),
    [optimisticUsers],
  );

  const filterOptions = RESIDENT_FILTERS.map((filter) => ({
    value: filter.value,
    label: filter.label,
    count: optimisticUsers.filter(filter.matches).length,
  }));

  // Narrow by the selected chip, then by the search box
  const filteredUsers = useMemo(() => {
    const matchesFilter =
      RESIDENT_FILTERS.find((filter) => filter.value === residentFilter)
        ?.matches ?? (() => true);
    return optimisticUsers.filter(
      (user) =>
        matchesFilter(user) &&
        (!searchQuery ||
          fuzzyMatch(searchQuery, user.firstName || "") ||
          fuzzyMatch(searchQuery, user.lastName || "") ||
          fuzzyMatch(searchQuery, user.name || "") ||
          fuzzyMatch(searchQuery, user.email || "") ||
          String(user.unitNumber ?? "").includes(searchQuery.trim())),
    );
  }, [optimisticUsers, residentFilter, searchQuery]);

  return (
    <div className="flex flex-col gap-5">
      {banner}
      {actionData?.error && (
        <StatusBanner variant="error" message={actionData.error} />
      )}
      {actionData?.success && (
        <StatusBanner
          key={successKey}
          variant="success"
          autoDismiss={3000}
          message={actionData.message || "Operation completed successfully"}
        />
      )}

      {/* Phones: heading and button share a row, help text below. Larger
          screens: heading over help text, button off to the right. */}
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1">
        <h2 className="text-xl font-semibold">
          Residents{" "}
          <span className="font-normal text-muted-foreground">
            · {optimisticUsers.length}
          </span>
        </h2>
        <Button
          variant="secondary"
          onClick={handleNewUser}
          className="h-11 md:row-span-2 md:h-10 md:self-end"
        >
          <UserPlusIcon />
          <span className="md:hidden">Invite</span>
          <span className="hidden md:inline">Invite Resident</span>
        </Button>
        <p className="col-span-2 max-w-2xl text-sm text-muted-foreground md:col-span-1">
          Everyone who can sign in to the website. Double-check that each email
          belongs to a real resident before you invite them.
        </p>
      </div>

      <PendingInvitesBanner
        pending={pendingUsers}
        isShowingPending={residentFilter === "pending"}
        onToggleShowPending={() =>
          setResidentFilter((current) =>
            current === "pending" ? "all" : "pending",
          )
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-2">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Name, email or unit..."
          className="h-11 md:h-10 md:max-w-sm"
        />
        <FilterChips
          ariaLabel="Show residents"
          options={filterOptions}
          selectedValues={[residentFilter]}
          // One chip at a time; tapping the selected chip goes back to All
          onToggle={(value) =>
            setResidentFilter((current) =>
              current === value ? "all" : value,
            )
          }
          scroll
          className="-mx-3 px-3 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <NoContent message="No residents found" />
      ) : (
        <>
          <div className="hidden md:block">
            <ResidentTable
              residents={filteredUsers}
              onOpenDetails={setDetailUser}
              onEdit={(user) => handleEditUser(user)}
              onRemove={setUserToRemove}
                  />
          </div>
          <div className="md:hidden">
            <ResidentList
              residents={filteredUsers}
              onOpenDetails={setDetailUser}
                  />
          </div>
        </>
      )}

      <ResponsiveOverlay
        open={detailUser !== null}
        onOpenChange={(open) => !open && setDetailUser(null)}
        title={detailUser?.name ?? ""}
        hideHeader
        bare
      >
        {detailUser && (
          <ResidentDetail
            resident={detailUser}
            onEdit={(user) => handleEditUser(user, true)}
            onRemove={(user) => {
              setDetailUser(null);
              setUserToRemove(user);
            }}
          />
        )}
      </ResponsiveOverlay>

      {/* Registration/Edit Overlay (dialog on desktop, drawer on mobile) */}
      <ResponsiveOverlay
        open={isOverlayOpen}
        onOpenChange={handleOverlayOpenChange}
        title={editingUserId ? "Update Resident" : "Register New Resident"}
        description={
          editingUserId
            ? undefined
            : "Enter the resident's information below. They will receive a welcome email with instructions to sign in and access their account."
        }
        headerStart={
          editingUser &&
          editingFromDetails && (
            <BackToDetails
              user={editingUser}
              onBack={() => {
                handleOverlayOpenChange(false);
                setDetailUser(editingUser);
              }}
            />
          )
        }
        bare
      >
        <Form method="post" className="flex min-h-0 flex-1 flex-col">
          <input
            type="hidden"
            name="intent"
            value={editingUserId ? "update" : "create"}
          />
          {editingUserId && (
            <input type="hidden" name="userId" value={editingUserId} />
          )}
          <OverlayBody className="flex flex-col gap-6">
            {actionData?.error && (
              <StatusBanner
                variant="error"
                message={actionData.error}
                className="shrink-0"
              />
            )}
            <ResidentForm
              firstName={newUserFirstName}
              lastName={newUserLastName}
              email={newUserEmail}
              unitNumber={newUserUnitNumber}
              role={newUserRole}
              onFirstNameChange={setNewUserFirstName}
              onLastNameChange={setNewUserLastName}
              onEmailChange={setNewUserEmail}
              onUnitNumberChange={setNewUserUnitNumber}
              onRoleChange={setNewUserRole}
              vertical
              editMode={editingUserId !== null}
            />
          </OverlayBody>
          <OverlayFooter className="md:justify-end">
            <ActionButton
              type="button"
              variant="outline"
              className="flex-1 md:flex-none"
              onClick={() => handleOverlayOpenChange(false)}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              variant="cta"
              className="flex-1 md:flex-none"
              disabled={!isFormValid}
            >
              {editingUserId ? "Save changes" : "Register"}
            </ActionButton>
          </OverlayFooter>
        </Form>
      </ResponsiveOverlay>

      {userToRemove && (
        <ConfirmActionDialog
          open
          onOpenChange={(open) => !open && setUserToRemove(null)}
          title="Remove this resident?"
          intent="delete"
          recordId={userToRemove.id}
          confirmLabel="Remove resident"
          pendingLabel="Removing..."
          cancelLabel="Keep them"
          destructive
          onSuccess={showSuccess}
        >
          <span className="font-medium text-foreground">
            {userToRemove.name}
          </span>{" "}
          will be signed out and won't be able to use the website anymore. This
          can't be undone.
        </ConfirmActionDialog>
      )}
    </div>
  );
}

function BackToDetails({
  user,
  onBack,
}: {
  user: Resident;
  onBack: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="-ml-1 flex h-8 w-fit cursor-pointer items-center gap-0.5 rounded-md pr-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
    >
      <ChevronLeftIcon className="size-4" />
      Back to {user.name || "resident"}
    </button>
  );
}

import type { Route } from "./+types/index";
import { eq } from "drizzle-orm";
import { useState, useEffect, useMemo } from "react";
import { UserPlusIcon } from "lucide-react";
import { useNavigation } from "react-router";
import { getAuth } from "~/auth";
import { getDatabase } from "~/util/database.server";
import { isAdmin } from "~/util/authHelpers.server";
import { Button } from "~/components/ui/button";
import { NoContent } from "~/components/NoContent";
import { SearchInput } from "~/components/SearchInput";
import { fuzzyMatch } from "~/util/fuzzySearch";
import { createActivityLogData } from "~/util/activityLogger.server";
import { StatusBanner } from "~/components/StatusBanner";
import * as schema from "../../../database/schema";
import { ResidentCard } from "./ResidentCard";
import { ResidentRegistrationDialog } from "./ResidentRegistrationDialog";
import { MobileUserDrawer } from "./MobileUserDrawer";

export async function loader({ request, context }: Route.LoaderArgs) {
  await isAdmin(request, context);

  // Fetch all users from database, excluding anonymous users
  const db = getDatabase(context);
  const users = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.isAnonymous, false))
    .all();

  return { users };
}

async function handleDeleteUser(
  userId: string,
  db: ReturnType<typeof getDatabase>,
  auth: ReturnType<typeof getAuth>,
  request: Request,
  actorUserId: string,
) {
  if (!userId) {
    return { error: "User ID is required" };
  }

  try {
    // Check if user exists and is not an admin
    const userToDelete = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .get();

    if (!userToDelete) {
      return { error: "User not found" };
    }

    if (userToDelete.role === "admin") {
      return { error: "Cannot delete admin users" };
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

    return { success: true, message: "Resident removed successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Failed to delete user" };
  }
}

async function handleCreateUser(
  firstName: string,
  lastName: string,
  email: string,
  unitNumber: string,
  role: string,
  db: ReturnType<typeof getDatabase>,
  auth: ReturnType<typeof getAuth>,
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

    // Send verification email
    await auth.api.sendVerificationEmail({
      body: {
        email,
        callbackURL: "/resident?verified=1",
      },
    });

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
    const userId = formData.get("userId") as string;
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
      getAuth(context),
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobileCreateDrawerOpen, setIsMobileCreateDrawerOpen] =
    useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [optimisticUsers, setOptimisticUsers] = useState(loaderData.users);
  const [successKey, setSuccessKey] = useState(0);

  // Sync optimistic users with loader data
  useEffect(() => {
    if (navigation.state === "idle") {
      setOptimisticUsers(loaderData.users);
    }
  }, [loaderData.users, navigation.state]);

  // Close dialogs after successful submission and increment success key
  useEffect(() => {
    if (navigation.state === "idle" && actionData?.success) {
      setIsDialogOpen(false);
      setIsMobileDrawerOpen(false);
      setIsMobileCreateDrawerOpen(false);
      setSuccessKey((prev) => prev + 1);
    }
  }, [navigation.state, actionData?.success]);

  // Clear form when all dialogs are closed
  useEffect(() => {
    if (!isDialogOpen && !isMobileDrawerOpen && !isMobileCreateDrawerOpen) {
      setNewUserFirstName("");
      setNewUserLastName("");
      setNewUserEmail("");
      setNewUserUnitNumber("");
      setNewUserRole("");
      setEditingUserId(null);
    }
  }, [isDialogOpen, isMobileDrawerOpen, isMobileCreateDrawerOpen]);

  // Handle edit user (desktop - uses dialog)
  const handleEditUser = (user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    unitNumber: number | null;
    role: string | null;
  }) => {
    setEditingUserId(user.id);
    setNewUserFirstName(user.firstName || "");
    setNewUserLastName(user.lastName || "");
    setNewUserEmail(user.email);
    setNewUserUnitNumber(user.unitNumber?.toString() || "");
    setNewUserRole(user.role || "");
    setIsDialogOpen(true);
  };

  // Handle edit user (mobile - uses drawer)
  const handleEditUserMobile = (user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    unitNumber: number | null;
    role: string | null;
  }) => {
    setEditingUserId(user.id);
    setNewUserFirstName(user.firstName || "");
    setNewUserLastName(user.lastName || "");
    setNewUserEmail(user.email);
    setNewUserUnitNumber(user.unitNumber?.toString() || "");
    setNewUserRole(user.role || "");
    setIsMobileDrawerOpen(true);
  };

  // Handle new user
  const handleNewUser = () => {
    setEditingUserId(null);
    setNewUserFirstName("");
    setNewUserLastName("");
    setNewUserEmail("");
    setNewUserUnitNumber("");
    setNewUserRole("");
    setIsDialogOpen(true);
  };

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

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery) {
      return optimisticUsers;
    }
    return optimisticUsers.filter(
      (user) =>
        fuzzyMatch(searchQuery, user.firstName || "") ||
        fuzzyMatch(searchQuery, user.lastName || "") ||
        fuzzyMatch(searchQuery, user.name || "") ||
        fuzzyMatch(searchQuery, user.email || ""),
    );
  }, [optimisticUsers, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
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

      <div className="bg-white rounded-xl px-4 pt-4 border-1 pb-8 shadow-md">
        <p className="mb-8 text-muted-foreground">
          Grant new residents access to the website by clicking the button
          below. Please double-check all email addresses belong to actual
          residents before submitting.
        </p>
        {/* Search and Register Button */}
        <div className="flex flex-row gap-3 items-center justify-between mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Name or email..."
            className="max-w-md"
          />
          <Button
            variant="secondary"
            onClick={handleNewUser}
            className="hidden md:flex"
          >
            <UserPlusIcon className="size-4 mr-2" />
            Invite Resident
          </Button>
          {/* Mobile Add User Button with Drawer */}
          <div className="md:hidden">
            <MobileUserDrawer
              firstName={newUserFirstName}
              lastName={newUserLastName}
              email={newUserEmail}
              unitNumber={newUserUnitNumber}
              role={newUserRole}
              isFormValid={isFormValid}
              onFirstNameChange={setNewUserFirstName}
              onLastNameChange={setNewUserLastName}
              onEmailChange={setNewUserEmail}
              onUnitNumberChange={setNewUserUnitNumber}
              onRoleChange={setNewUserRole}
              actionData={actionData}
              open={isMobileCreateDrawerOpen}
              onOpenChange={setIsMobileCreateDrawerOpen}
            />
          </div>
        </div>

        {/* Resident Cards - Desktop (uses dialog for edit) */}
        <div className="space-y-2 hidden md:block">
          {filteredUsers.length === 0 ? (
            <NoContent message="No residents found" />
          ) : (
            filteredUsers.map((user) => (
              <ResidentCard
                key={user.id}
                user={user}
                isAdmin={true}
                onEdit={handleEditUser}
              />
            ))
          )}
        </div>

        {/* Resident Cards - Mobile (uses drawer for edit) */}
        <div className="space-y-2 md:hidden">
          {filteredUsers.length === 0 ? (
            <NoContent message="No residents found" />
          ) : (
            filteredUsers.map((user) => (
              <ResidentCard
                key={user.id}
                user={user}
                isAdmin={true}
                onEdit={handleEditUserMobile}
              />
            ))
          )}
        </div>
      </div>

      {/* Desktop Registration Dialog (hidden on mobile) */}
      <div className="hidden md:block">
        <ResidentRegistrationDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          firstName={newUserFirstName}
          lastName={newUserLastName}
          email={newUserEmail}
          unitNumber={newUserUnitNumber}
          role={newUserRole}
          isFormValid={isFormValid}
          onFirstNameChange={setNewUserFirstName}
          onLastNameChange={setNewUserLastName}
          onEmailChange={setNewUserEmail}
          onUnitNumberChange={setNewUserUnitNumber}
          onRoleChange={setNewUserRole}
          actionData={actionData}
          editMode={editingUserId !== null}
          userId={editingUserId || undefined}
        />
      </div>

      {/* Mobile Edit Drawer (only shown on mobile for editing) */}
      <div className="md:hidden">
        <MobileUserDrawer
          firstName={newUserFirstName}
          lastName={newUserLastName}
          email={newUserEmail}
          unitNumber={newUserUnitNumber}
          role={newUserRole}
          isFormValid={isFormValid}
          onFirstNameChange={setNewUserFirstName}
          onLastNameChange={setNewUserLastName}
          onEmailChange={setNewUserEmail}
          onUnitNumberChange={setNewUserUnitNumber}
          onRoleChange={setNewUserRole}
          actionData={actionData}
          editMode={true}
          userId={editingUserId || undefined}
          open={isMobileDrawerOpen}
          onOpenChange={setIsMobileDrawerOpen}
        />
      </div>
    </div>
  );
}

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
import * as schema from "../../../database/schema";
import { ResidentCard } from "./ResidentCard";
import { ResidentRegistrationDialog } from "./ResidentRegistrationDialog";
import { MobileUserDrawer } from "./MobileUserDrawer";
import { StatusBanner } from "~/components/StatusBanner";
import { SearchInput } from "~/components/SearchInput";
import { fuzzyMatch } from "~/util/fuzzySearch";

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

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Failed to delete user" };
  }
}

async function handleCreateUser(
  name: string,
  email: string,
  role: string,
  db: ReturnType<typeof getDatabase>,
  auth: ReturnType<typeof getAuth>,
) {
  if (!name || !email || !role) {
    return { error: "Name, email, and role are required" };
  }

  try {
    // Insert new user into database
    const newUser = await db
      .insert(schema.users)
      .values({
        id: crypto.randomUUID(),
        name,
        email,
        role,
        isAnonymous: false,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .get();

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
  name: string,
  email: string,
  role: string,
  db: ReturnType<typeof getDatabase>,
) {
  if (!userId || !name || !email || !role) {
    return { error: "User ID, name, email, and role are required" };
  }

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

    // Update user in database
    await db
      .update(schema.users)
      .set({
        name,
        email,
        role,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    return { success: true, message: "User updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: "Failed to update user. Email may already exist." };
  }
}

export async function action({ request, context }: Route.ActionArgs) {
  await isAdmin(request, context, { returnUnauthorized: true });

  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const db = getDatabase(context);
  const auth = getAuth(context);

  if (intent === "delete") {
    const userId = formData.get("userId") as string;
    return handleDeleteUser(userId, db, auth, request);
  }

  if (intent === "create") {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    return handleCreateUser(name, email, role, db, getAuth(context));
  }

  if (intent === "update") {
    const userId = formData.get("userId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    return handleUpdateUser(userId, name, email, role, db);
  }

  return { error: "Invalid intent" };
}

export default function ResidentManagement({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [optimisticUsers, setOptimisticUsers] = useState(loaderData.users);

  // Sync optimistic users with loader data
  useEffect(() => {
    if (navigation.state === "idle") {
      setOptimisticUsers(loaderData.users);
    }
  }, [loaderData.users, navigation.state]);

  // Clear form after successful submission
  useEffect(() => {
    if (actionData?.success) {
      setNewUserName("");
      setNewUserEmail("");
      setNewUserRole("");
      setEditingUserId(null);
    }
  }, [actionData?.success]);

  // Handle edit user
  const handleEditUser = (user: {
    id: string;
    name: string | null;
    email: string;
    role: string | null;
  }) => {
    setEditingUserId(user.id);
    setNewUserName(user.name || "");
    setNewUserEmail(user.email);
    setNewUserRole(user.role || "");
    setIsDialogOpen(true);
  };

  // Handle new user
  const handleNewUser = () => {
    setEditingUserId(null);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("");
    setIsDialogOpen(true);
  };

  const isFormValid = Boolean(
    newUserName.trim() && newUserEmail.trim() && newUserRole,
  );

  // Apply optimistic update when submitting
  useEffect(() => {
    if (navigation.state === "submitting" && navigation.formData) {
      const intent = navigation.formData.get("intent");
      const userId = navigation.formData.get("userId") as string;
      const name = navigation.formData.get("name") as string;
      const email = navigation.formData.get("email") as string;
      const role = navigation.formData.get("role") as string;

      if (intent === "update" && userId) {
        // Optimistically update the user
        setOptimisticUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, name, email, role, updatedAt: new Date() }
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
          variant="success"
          message={"Operation completed successfully"}
        />
      )}

      <div className="bg-white rounded-xl px-4 pt-4 border-1 pb-8 shadow-md">
        <p className="mb-8 text-muted-foreground">
          In order to grant access to the protected pages of our website, new
          residents must be officially registered below. Once their information
          has been submitted, they will receive instructions for how to verify
          their email address and sign in. Please double check all email
          addresses before sending out invitations as the recipients will be
          able to access our site.
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
              name={newUserName}
              email={newUserEmail}
              role={newUserRole}
              isFormValid={isFormValid}
              onNameChange={setNewUserName}
              onEmailChange={setNewUserEmail}
              onRoleChange={setNewUserRole}
              actionData={actionData}
            />
          </div>
        </div>

        {/* Resident Cards */}
        <div className="space-y-2">
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
      </div>

      {/* Desktop Registration Dialog */}
      <ResidentRegistrationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        name={newUserName}
        email={newUserEmail}
        role={newUserRole}
        isFormValid={isFormValid}
        onNameChange={setNewUserName}
        onEmailChange={setNewUserEmail}
        onRoleChange={setNewUserRole}
        actionData={actionData}
        editMode={editingUserId !== null}
        userId={editingUserId || undefined}
      />
    </div>
  );
}

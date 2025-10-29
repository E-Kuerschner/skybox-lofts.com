import type { Route } from "./+types/index";
import { Form } from "react-router";
import { eq } from "drizzle-orm";
import { useState, useEffect } from "react";
import { getAuth } from "~/auth";
import { getDatabase } from "~/util/database.server";
import { isAdmin } from "~/util/authHelpers.server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import * as schema from "../../../database/schema";
import { NewResidentForm } from "./NewResidentForm";
import { MobileUserDrawer } from "./MobileUserDrawer";
import { StatusBanner } from "~/components/StatusBanner";

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

    await db.delete(schema.users).where(eq(schema.users.id, userId));
    return { success: true };
  } catch (error) {
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

export async function action({ request, context }: Route.ActionArgs) {
  await isAdmin(request, context, { returnUnauthorized: true });

  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const db = getDatabase(context);

  if (intent === "delete") {
    const userId = formData.get("userId") as string;
    return handleDeleteUser(userId, db);
  }

  if (intent === "create") {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    return handleCreateUser(name, email, role, db, getAuth(context));
  }

  return { error: "Invalid intent" };
}

export default function ResidentManagement({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("");

  // Clear form after successful submission
  useEffect(() => {
    if (actionData?.success) {
      setNewUserName("");
      setNewUserEmail("");
      setNewUserRole("");
    }
  }, [actionData?.success]);

  const isFormValid = Boolean(
    newUserName.trim() && newUserEmail.trim() && newUserRole,
  );

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

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email Verified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loaderData.users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="capitalize">{user.role || ""}</TableCell>
                <TableCell>
                  {user.emailVerified ? (
                    <span className="text-emerald-600"> Verified</span>
                  ) : (
                    <span className="text-muted-foreground">Pending</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {user.role === "admin" ? (
                    <span className="text-sm text-muted-foreground">—</span>
                  ) : (
                    <Form method="post">
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="userId" value={user.id} />
                      <Button
                        type="submit"
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          if (
                            !confirm(
                              `Are you sure you want to delete ${user.name}?`,
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </Form>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {/* New User Row - Desktop Only */}
            <TableRow className="bg-muted/50 hidden md:table-row">
              <TableCell colSpan={5}>
                <Form method="post">
                  <NewResidentForm
                    name={newUserName}
                    email={newUserEmail}
                    role={newUserRole}
                    isFormValid={isFormValid}
                    onNameChange={setNewUserName}
                    onEmailChange={setNewUserEmail}
                    onRoleChange={setNewUserRole}
                    submitLabel="Register"
                  />
                </Form>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

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
  );
}

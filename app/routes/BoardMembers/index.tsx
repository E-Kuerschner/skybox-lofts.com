import type { Route } from "./+types/index";
import { getDatabase } from "~/util/database.server";
import { isAuthenticated } from "~/util/authHelpers.server";
import { boardMembers } from "../../../database/schema";
import { eq } from "drizzle-orm";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Form } from "react-router";
import { Trash2Icon, Edit3Icon } from "lucide-react";
import NewBoardMemberForm from "./NewBoardMemberForm";
import MobileBoardMemberDrawer from "./MobileBoardMemberDrawer";
import { StatusBanner } from "~/components/StatusBanner";
import { Switch } from "~/components/ui/switch";

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await isAuthenticated(request, context);
  const db = getDatabase(context);

  const boardMemberData = await db.select().from(boardMembers);
  return {
    boardMemberData,
    isAdmin: session.user.role === "admin",
  };
}

async function handleDeleteBoardMember(
  boardMemberId: string,
  db: ReturnType<typeof getDatabase>,
) {
  if (!boardMemberId) {
    return { error: "Board member ID is required" };
  }

  try {
    const memberToDelete = await db
      .select()
      .from(boardMembers)
      .where(eq(boardMembers.id, Number(boardMemberId)))
      .get();

    if (!memberToDelete) {
      return { error: "Board member not found" };
    }

    await db
      .delete(boardMembers)
      .where(eq(boardMembers.id, Number(boardMemberId)));
    return { success: true, message: "Board member deleted successfully" };
  } catch (error) {
    return { error: "Failed to delete board member" };
  }
}

async function handleCreateBoardMember(
  name: string,
  role: string,
  db: ReturnType<typeof getDatabase>,
) {
  if (!name || !role) {
    return { error: "Name and position are required" };
  }

  try {
    await db.insert(boardMembers).values({
      name,
      role,
    });
    return { success: true, message: "Board member added successfully" };
  } catch (error) {
    return { error: "Failed to create board member" };
  }
}

export async function action({ request, context }: Route.ActionArgs) {
  const session = await isAuthenticated(request, context);

  // Only admins can create or delete board members
  if (session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const db = getDatabase(context);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const boardMemberId = formData.get("boardMemberId") as string;
    return handleDeleteBoardMember(boardMemberId, db);
  }

  if (intent === "create") {
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    return handleCreateBoardMember(name, role, db);
  }

  return { success: false, error: "Invalid action" };
}

export default function BoardMembers({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  const [editMode, setEditMode] = useState(false);

  // Clear form after successful submission
  useEffect(() => {
    if (actionData?.success) {
      setNewMemberName("");
      setNewMemberRole("");
    }
  }, [actionData?.success]);

  const isFormValid = Boolean(newMemberName.trim() && newMemberRole.trim());

  return (
    <div className="flex flex-col">
      {actionData?.error && (
        <StatusBanner
          className="mb-4"
          variant="error"
          message={actionData.error}
        />
      )}
      {actionData?.success && (
        <StatusBanner
          className="mb-4"
          variant="success"
          message="Operation completed successfully"
        />
      )}

      <div className="bg-white rounded-xl px-4 pt-4 border-1 pb-8 shadow-md">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <p className="text-muted-foreground">
            Serving on the HOA board is voluntary. If you are interesting in
            helping our community, please contact any of the current board
            members.
          </p>
          {/* Admin Upload Button */}
          {loaderData.isAdmin && (
            <Button
              variant={editMode ? "outline" : "secondary"}
              onClick={() => setEditMode((prev) => !prev)}
            >
              {editMode ? (
                "Done"
              ) : (
                <>
                  <Edit3Icon className="size-4 mr-2" />
                  Make changes
                </>
              )}
            </Button>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow className="*:font-bold px-4">
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              {editMode && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* New Board Member Row - Desktop Only - Admin Only */}
            {editMode && (
              <TableRow className="bg-muted hover:bg-muted hidden md:table-row">
                <TableCell className="py-4" colSpan={3}>
                  <Form method="post">
                    <NewBoardMemberForm
                      name={newMemberName}
                      role={newMemberRole}
                      isFormValid={isFormValid}
                      onNameChange={setNewMemberName}
                      onRoleChange={setNewMemberRole}
                      submitLabel="Add"
                    />
                  </Form>
                </TableCell>
              </TableRow>
            )}
            {loaderData.boardMemberData.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.role}</TableCell>
                {editMode && (
                  <TableCell className="text-right">
                    <Form method="post">
                      <input type="hidden" name="intent" value="delete" />
                      <input
                        type="hidden"
                        name="boardMemberId"
                        value={member.id}
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="hover:text-destructive"
                        onClick={(e) => {
                          if (
                            !confirm(
                              `Are you sure you want to remove ${member.name} from the board?`,
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </Form>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Add Board Member Button with Drawer - Admin Only */}
      {editMode && (
        <div className="md:hidden mt-4">
          <MobileBoardMemberDrawer
            name={newMemberName}
            role={newMemberRole}
            isFormValid={isFormValid}
            onNameChange={setNewMemberName}
            onRoleChange={setNewMemberRole}
            actionData={actionData}
          />
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { NewResidentForm } from "./NewResidentForm";
import { StatusBanner } from "~/components/StatusBanner";
import { UserPlusIcon } from "lucide-react";

type MobileUserDrawerProps = {
  name: string;
  email: string;
  role: string;
  isFormValid: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  actionData?: { success?: boolean; error?: string; message?: string };
  editMode?: boolean;
  userId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function MobileUserDrawer({
  name,
  email,
  role,
  isFormValid,
  onNameChange,
  onEmailChange,
  onRoleChange,
  actionData,
  editMode = false,
  userId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: MobileUserDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  // Close drawer on successful submission
  useEffect(() => {
    if (actionData?.success) {
      // Close both internal and controlled state to ensure drawer closes
      setInternalOpen(false);
      if (controlledOnOpenChange) {
        controlledOnOpenChange(false);
      }
    }
  }, [actionData?.success, controlledOnOpenChange]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!editMode && (
        <SheetTrigger asChild>
          <Button size="icon" variant="secondary">
            <UserPlusIcon className="size-4" />
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="site-bg" side="bottom">
        <SheetHeader>
          <SheetTitle>
            {editMode ? "Update Resident" : "Register Resident"}
          </SheetTitle>
          {!editMode && (
            <SheetDescription>
              Enter the resident's information below. They will receive a
              welcome email with a link to verify their email.
            </SheetDescription>
          )}
        </SheetHeader>

        {/* Error/Success Messages */}
        {actionData?.error && (
          <StatusBanner
            variant="error"
            message={actionData.error}
            className="mt-4"
          />
        )}

        <Form method="post" className="mt-6">
          <input
            type="hidden"
            name="intent"
            value={editMode ? "update" : "create"}
          />
          {editMode && userId && (
            <input type="hidden" name="userId" value={userId} />
          )}
          <NewResidentForm
            name={name}
            email={email}
            role={role}
            isFormValid={isFormValid}
            onNameChange={onNameChange}
            onEmailChange={onEmailChange}
            onRoleChange={onRoleChange}
            submitLabel={editMode ? "Save" : "Submit"}
            vertical
          />
        </Form>
      </SheetContent>
    </Sheet>
  );
}

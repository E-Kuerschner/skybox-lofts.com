import { useState, useEffect } from "react";
import { Form } from "react-router";
import { UserPlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { StatusBanner } from "~/components/StatusBanner";
import { NewResidentForm } from "./NewResidentForm";

type MobileUserDrawerProps = {
  firstName: string;
  lastName: string;
  email: string;
  unitNumber: string;
  role: string;
  isFormValid: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onUnitNumberChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  actionData?: { success?: boolean; error?: string; message?: string };
  editMode?: boolean;
  userId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function MobileUserDrawer({
  firstName,
  lastName,
  email,
  unitNumber,
  role,
  isFormValid,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onUnitNumberChange,
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
      <SheetContent
        className="site-bg"
        side="bottom"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
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
            firstName={firstName}
            lastName={lastName}
            email={email}
            unitNumber={unitNumber}
            role={role}
            isFormValid={isFormValid}
            onFirstNameChange={onFirstNameChange}
            onLastNameChange={onLastNameChange}
            onEmailChange={onEmailChange}
            onUnitNumberChange={onUnitNumberChange}
            onRoleChange={onRoleChange}
            submitLabel={editMode ? "Save" : "Submit"}
            vertical
            editMode={editMode}
          />
        </Form>
      </SheetContent>
    </Sheet>
  );
}

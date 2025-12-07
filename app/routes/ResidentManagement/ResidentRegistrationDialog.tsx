import { useEffect } from "react";
import { Form } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { StatusBanner } from "~/components/StatusBanner";
import { NewResidentForm } from "./NewResidentForm";

type ResidentRegistrationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
};

export function ResidentRegistrationDialog({
  open,
  onOpenChange,
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
}: ResidentRegistrationDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  // Close dialog on successful submission
  useEffect(() => {
    if (actionData?.success) {
      onOpenChange(false);
    }
  }, [actionData?.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="site-bg">
        <DialogHeader>
          <DialogTitle>
            {editMode ? "Update Resident" : "Register New Resident"}
          </DialogTitle>
          {!editMode && (
            <DialogDescription>
              Enter the resident's information below. They will receive a
              welcome email with instructions to sign in and access their account.
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Error Message */}
        {actionData?.error && (
          <StatusBanner
            variant="error"
            message={actionData.error}
            className="mt-4"
          />
        )}

        <Form method="post" className="mt-4">
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
            submitLabel={editMode ? "Save" : "Register"}
            vertical
            editMode={editMode}
          />
        </Form>
      </DialogContent>
    </Dialog>
  );
}

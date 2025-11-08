import { useEffect } from "react";
import { Form } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { NewResidentForm } from "./NewResidentForm";
import { StatusBanner } from "~/components/StatusBanner";

type ResidentRegistrationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
};

export function ResidentRegistrationDialog({
  open,
  onOpenChange,
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
              welcome email with a link to verify their email and set up their
              account.
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
            name={name}
            email={email}
            role={role}
            isFormValid={isFormValid}
            onNameChange={onNameChange}
            onEmailChange={onEmailChange}
            onRoleChange={onRoleChange}
            submitLabel={editMode ? "Save" : "Register"}
            vertical
          />
        </Form>
      </DialogContent>
    </Dialog>
  );
}

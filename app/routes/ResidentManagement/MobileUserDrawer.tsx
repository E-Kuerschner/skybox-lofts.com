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
}: MobileUserDrawerProps) {
  const [open, setOpen] = useState(false);

  // Close drawer on successful submission
  useEffect(() => {
    if (actionData?.success) {
      setOpen(false);
    }
  }, [actionData?.success]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="secondary">
          <UserPlusIcon className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="site-bg" side="bottom">
        <SheetHeader>
          <SheetTitle>Register Resident</SheetTitle>
          <SheetDescription>
            Enter the resident's information below. They will receive a welcome
            email with a link to verify their email.
          </SheetDescription>
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
          <NewResidentForm
            name={name}
            email={email}
            role={role}
            isFormValid={isFormValid}
            onNameChange={onNameChange}
            onEmailChange={onEmailChange}
            onRoleChange={onRoleChange}
            submitLabel="Submit"
            vertical
          />
        </Form>
      </SheetContent>
    </Sheet>
  );
}

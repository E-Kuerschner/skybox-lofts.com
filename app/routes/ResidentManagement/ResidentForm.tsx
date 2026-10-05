import { Input } from "~/components/ui/input";
import { useState } from "react";
import { ActionButton } from "~/components/ActionButton";
import { ResponsiveOverlay } from "~/components/ResponsiveOverlay";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/util/ui/utils";

type ResidentFormProps = {
  firstName: string;
  lastName: string;
  email: string;
  unitNumber: string;
  role: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onUnitNumberChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  className?: string;
  vertical?: boolean;
  editMode?: boolean;
};

export function ResidentForm({
  firstName,
  lastName,
  email,
  unitNumber,
  role,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onUnitNumberChange,
  onRoleChange,
  className,
  vertical = false,
  editMode = false,
}: ResidentFormProps) {
  const [confirmAdminOpen, setConfirmAdminOpen] = useState(false);

  // Admins can do anything, so ask before handing that out
  const handleRoleChange = (value: string) => {
    if (value === "admin") {
      setConfirmAdminOpen(true);
    } else {
      onRoleChange(value);
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center",
          vertical ? "flex-col gap-5" : "flex-row gap-4",
          className,
        )}
      >
        <input type="hidden" name="intent" value="create" />
        <div className={vertical ? "w-full space-y-2" : "flex-1"}>
          {vertical && (
            <Label htmlFor="user-first-name">
              First Name <span className="text-destructive">*</span>
            </Label>
          )}
          <Input
            id="user-first-name"
            name="firstName"
            placeholder="First Name"
            required
            className="bg-background"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
          />
        </div>
        <div className={vertical ? "w-full space-y-2" : "flex-1"}>
          {vertical && (
            <Label htmlFor="user-last-name">
              Last Name <span className="text-destructive">*</span>
            </Label>
          )}
          <Input
            id="user-last-name"
            name="lastName"
            placeholder="Last Name"
            required
            className="bg-background"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
          />
        </div>
        <div className={vertical ? "w-full space-y-2" : "flex-1"}>
          {vertical && (
            <Label
              htmlFor="user-email"
              className={editMode ? "text-muted-foreground" : ""}
            >
              Email Address{" "}
              {!editMode && <span className="text-destructive">*</span>}
              {editMode && "(cannot be changed)"}
            </Label>
          )}
          <Input
            id="user-email"
            name="email"
            type="email"
            placeholder="Email Address"
            required={!editMode}
            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
            className={cn(
              "bg-background",
              editMode && "cursor-not-allowed opacity-60",
            )}
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={editMode}
            readOnly={editMode}
          />
        </div>
        <div className={vertical ? "w-full space-y-2" : "w-32"}>
          {vertical && (
            <Label htmlFor="user-unit">
              Unit Number <span className="text-destructive">*</span>
            </Label>
          )}
          <Input
            id="user-unit"
            name="unitNumber"
            type="number"
            placeholder="Unit"
            required
            min="0"
            className="bg-background"
            value={unitNumber}
            onChange={(e) => onUnitNumberChange(e.target.value)}
          />
        </div>
        <div className={vertical ? "w-full space-y-2" : "w-40"}>
          {vertical && (
            <Label htmlFor="user-role">
              Role <span className="text-destructive">*</span>
            </Label>
          )}
          <Select
            name="role"
            required
            value={role}
            onValueChange={handleRoleChange}
          >
            <SelectTrigger id="user-role" className="bg-background w-full">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="renter">Renter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ResponsiveOverlay
        open={confirmAdminOpen}
        onOpenChange={setConfirmAdminOpen}
        title="Make this resident an admin?"
        description="Admins can use every feature and can add or remove other residents."
        footer={
          <>
            <ActionButton
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmAdminOpen(false)}
            >
              Keep current role
            </ActionButton>
            <ActionButton
              type="button"
              variant="cta"
              className="flex-1"
              onClick={() => {
                onRoleChange("admin");
                setConfirmAdminOpen(false);
              }}
            >
              Make admin
            </ActionButton>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to give this resident admin access?
        </p>
      </ResponsiveOverlay>
    </>
  );
}

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/util/ui/utils";

type UserFormProps = {
  name: string;
  email: string;
  unitNumber: string;
  role: string;
  isFormValid: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onUnitNumberChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  submitLabel?: string;
  className?: string;
  vertical?: boolean;
};

export function NewResidentForm({
  name,
  email,
  unitNumber,
  role,
  isFormValid,
  onNameChange,
  onEmailChange,
  onUnitNumberChange,
  onRoleChange,
  submitLabel = "Save",
  className,
  vertical = false,
}: UserFormProps) {
  const handleRoleChange = (value: string) => {
    if (value === "admin") {
      const confirmed = window.confirm(
        "You are about to invite a new resident with admin capabilities. Admins can access all features and can add/remove other residents. Are you sure you want to proceed?",
      );
      if (confirmed) {
        onRoleChange(value);
      }
    } else {
      onRoleChange(value);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center",
        vertical ? "flex-col gap-5" : "flex-row gap-4",
        className,
      )}
    >
      <input type="hidden" name="intent" value="create" />
      <div className={vertical ? "w-full space-y-2" : "flex-1"}>
        {vertical && <Label htmlFor="user-name">Full Name</Label>}
        <Input
          id="user-name"
          name="name"
          placeholder="Full Name"
          required
          className="bg-background"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>
      <div className={vertical ? "w-full space-y-2" : "flex-1"}>
        {vertical && <Label htmlFor="user-email">Email Address</Label>}
        <Input
          id="user-email"
          name="email"
          type="email"
          placeholder="Email Address"
          required
          pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
          className="bg-background"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </div>
      <div className={vertical ? "w-full space-y-2" : "w-32"}>
        {vertical && <Label htmlFor="user-unit">Unit Number</Label>}
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
        {vertical && <Label htmlFor="user-role">Role</Label>}
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
            <SelectItem value="resident">Resident</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className={vertical ? "w-full" : "w-32"}>
        <Button
          variant="cta"
          type="submit"
          className="w-full"
          disabled={!isFormValid}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

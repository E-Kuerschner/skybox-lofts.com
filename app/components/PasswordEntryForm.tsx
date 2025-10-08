import { Form, useActionData } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export function PasswordEntryForm() {
  const actionData = useActionData<{ error?: string }>();

  return (
    <Card className="max-w-md mx-auto border-4 border-[#2d5016]/10 shadow-xl min-w-[300px] md:min-w-[400px] min-h-[350px]">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-center">Resident Access</CardTitle>
        <CardDescription className="text-center">
          Enter the building password to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post" className="space-y-4 flex flex-col grow">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              required
              placeholder="Enter password"
              className="text-lg"
            />
          </div>
          {actionData?.error && (
            <div className="text-destructive text-sm font-medium">
              {actionData.error}
            </div>
          )}
          <div className="flex items-end grow">
            <Button
              type="submit"
              size="lg"
              className="w-full transition-all"
              variant="cta"
            >
              Sign In
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

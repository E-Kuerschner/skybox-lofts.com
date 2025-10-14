import { useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";
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
import { cn } from "~/util/ui/utils";

export function PasswordEntryForm() {
  const [loginMethod, setLoginMethod] = useState<"anonymous" | "full">(
    "anonymous",
  );
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();

  const isSubmitting = navigation.formAction === "/resident/login";

  return (
    <Card className="max-w-md mx-auto border-4 border-[#2d5016]/10 shadow-xl min-w-[300px] md:min-w-[400px] min-h-[350px]">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-center">
          {loginMethod === "anonymous" ? "Resident Access" : "Resident Log In"}
        </CardTitle>
        <CardDescription className="text-center">
          {loginMethod === "anonymous"
            ? "Enter the building password to continue"
            : "Enter your email to receive a one-time link"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post" className="space-y-4 flex flex-col grow">
          <input type="hidden" value={loginMethod} name="loginMethod" />
          {/* resident password input*/}
          <div className={cn("space-y-2", { hidden: loginMethod === "full" })}>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              required={loginMethod === "anonymous"}
              placeholder="Enter password"
              className="text-lg"
            />
          </div>
          {/* email input*/}
          <div
            className={cn("space-y-2", { hidden: loginMethod === "anonymous" })}
          >
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              required={loginMethod === "full"}
              placeholder="Enter your email"
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
              disabled={isSubmitting}
            >
              {loginMethod === "anonymous" ? "Sign In" : "Get link"}
            </Button>
          </div>
          {loginMethod === "anonymous" ? (
            <p className="text-sm text-muted-foreground">
              Or, to access more features,{" "}
              <span className="link" onClick={() => setLoginMethod("full")}>
                log in using your email.
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Or, for limited but immediate access,{" "}
              <span
                className="link"
                onClick={() => setLoginMethod("anonymous")}
              >
                enter the resident site password.
              </span>
            </p>
          )}
        </Form>
      </CardContent>
    </Card>
  );
}

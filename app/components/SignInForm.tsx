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
import { StatusBanner } from "~/components/StatusBanner";
import TextLogo from "~/components/text-logo.svg";

// Whichever step is showing fades in and rises into place when it mounts.
// Under reduced motion only the fade remains.
const stepEnterClassName =
  "animate-in fade-in motion-safe:slide-in-from-bottom-2 duration-300 ease-[cubic-bezier(0.19,1,0.22,1)]";

type Props = {
  magicLinkEmailSent: boolean;
};

export function SignInForm({ magicLinkEmailSent }: Props) {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();

  const isSubmitting = navigation.formAction === "/resident/login";
  const emailSentState = navigation.state === "idle" && magicLinkEmailSent;

  return (
    <Card className="max-w-md md:shadow-xl min-w-full md:mx-auto md:min-w-[500px] min-h-[550px] ">
      <CardHeader>
        <a href="/" aria-label="Go home" className="w-fit m-auto mb-8">
          <img
            src={TextLogo}
            alt="Skybox Lofts"
            className="drop-shadow-xl hover:scale-[1.05] transition-transform duration-200"
          />
        </a>
        <CardTitle className="text-2xl text-start">Resident Sign-In</CardTitle>
        <CardDescription className="text-start">
          <p>
            Registered residents can access building information, documents and
            community features.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-4">
        <Form method="post" className="space-y-4 flex flex-col grow">
          {emailSentState ? (
            <div
              key="email-sent"
              className={cn("flex flex-col gap-4", stepEnterClassName)}
            >
              <StatusBanner
                variant="success"
                message="We sent an email containing your single-use sign-in
                    link. Click the link to continue to the resident portal.
                    You may close this tab."
                className="mt-4 text-start"
              />
              <input type="hidden" name="intent" value="reset-email" />
              <p className="text-sm text-muted-foreground">
                Not seeing the email? Try looking in your spam folder or{" "}
                <button className="link" type="submit">
                  request a new email.
                </button>
              </p>
            </div>
          ) : (
            <div
              key="email-entry"
              className={cn("space-y-2", stepEnterClassName)}
            >
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                required
                placeholder="Enter your email"
                className="text-lg"
              />
            </div>
          )}
          {actionData?.error && (
            <StatusBanner variant="error" message={actionData.error} />
          )}
          <div className="flex items-end grow">
            <Button
              type="submit"
              size="lg"
              className="w-full transition-all"
              variant="cta"
              disabled={isSubmitting || emailSentState}
            >
              Get sign-in link
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

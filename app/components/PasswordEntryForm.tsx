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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { cn } from "~/util/ui/utils";
import { StatusBanner } from "~/components/StatusBanner";
import TextLogo from "~/components/text-logo.svg";

type Props = {
  magicLinkEmailSent: boolean;
};

export function PasswordEntryForm({ magicLinkEmailSent }: Props) {
  const [loginMethod, setLoginMethod] = useState<"anonymous" | "full">("full");
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();

  const isSubmitting = navigation.formAction === "/resident/login";
  const emailSentState =
    loginMethod === "full" && navigation.state === "idle" && magicLinkEmailSent;

  return (
    <Card className="max-w-md md:shadow-lg min-w-full md:mx-auto md:min-w-[500px] min-h-[550px]">
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
          <input type="hidden" value={loginMethod} name="loginMethod" />
          <Accordion
            type="single"
            value={emailSentState ? "email-sent" : loginMethod}
          >
            <AccordionItem
              value="full"
              className="border-0 data-[state=closed]:opacity-0 transition-opacity duration-500"
            >
              <AccordionContent>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    required={loginMethod === "full"}
                    placeholder="Enter your email"
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Or for temporary, immediate access{" "}
                    <span
                      className="link"
                      onClick={() => setLoginMethod("anonymous")}
                    >
                      enter the site password.
                    </span>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="email-sent"
              className="border-0 data-[state=closed]:opacity-0 transition-opacity duration-500"
            >
              <AccordionContent>
                <div className="flex flex-col gap-4">
                  <StatusBanner
                    variant="success"
                    message="We sent an email containing your single-use sign-in
                        link. Click the link to continue to the resident portal.
                        You may close this tab."
                    className="mt-4 text-start"
                  />
                  <>
                    <input type="hidden" name="intent" value="reset-email" />
                    <p className="text-sm text-muted-foreground">
                      Not seeing the email? Try looking in your spam folder or{" "}
                      <button className="link" type="submit">
                        request a new email.
                      </button>
                    </p>
                  </>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="anonymous"
              className="border-0 data-[state=closed]:opacity-0 transition-opacity duration-500"
            >
              <AccordionContent>
                <div className="space-y-2">
                  <Label htmlFor="password">Site Password</Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    required={loginMethod === "anonymous"}
                    placeholder="Enter site password"
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Nevermind,{" "}
                    <span
                      className="link"
                      onClick={() => setLoginMethod("full")}
                    >
                      log in with my email.
                    </span>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
              {loginMethod === "anonymous" ? "Sign In" : "Get sign-in link"}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

import { Resend } from "resend";
import type { Route } from "./+types/contact";
import { isAuthenticated } from "~/util/authHelpers.server";

export async function action({ request, context }: Route.ActionArgs) {
  await isAuthenticated(request, context, {
    skipRedirect: true,
  });

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  // Validate required fields (email is optional)
  if (!name || !subject || !message) {
    return {
      success: false,
      error: "Name, subject, and message are required",
    };
  }

  const resend = new Resend(context.cloudflare.env.RESEND_KEY);

  try {
    const emailBody = email
      ? `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      : `Name: ${name}\n\nMessage:\n${message}`;

    const { data, error } = await resend.emails.send({
      from: "contact-form@skybox-lofts.com",
      to: [context.cloudflare.env.CONTACT_US_EMAIL],
      subject: `Contact Form: ${subject}`,
      text: emailBody,
      replyTo: email || undefined,
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        error: "Failed to send email. Please try again.",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

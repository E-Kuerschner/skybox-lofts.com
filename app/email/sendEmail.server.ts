import { Resend } from "resend";
import type { EmailTemplate } from "./emailTemplate";

export type { EmailTemplate };

export async function sendEmail(
  env: Env,
  to: string,
  subject: string,
  template: EmailTemplate,
) {
  if (import.meta.env.DEV) {
    console.log(template.debugMessage);
    return;
  }

  const resend = new Resend(env.RESEND_KEY);
  const { error } = await resend.emails.send({
    from: "no-reply@skybox-lofts.com",
    to: [to],
    subject,
    html: template.html,
  });

  if (error) {
    console.error("Resend error:", error);
  }
}

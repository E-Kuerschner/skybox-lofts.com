import type { AppLoadContext } from "react-router";
import { Resend } from "resend";

export const sendEmail = async (
  ctx: AppLoadContext,
  to: string,
  emailSubject: string,
  emailBody: string,
) => {
  const resend = new Resend(ctx.cloudflare.env.RESEND_KEY);

  const { data, error } = await resend.emails.send({
    from: "no-reply@skybox-lofts.com",
    to: [to],
    subject: emailSubject,
    // text: emailBody,
    html: emailBody,
  });

  if (error) {
    console.error("Resend error:", error);
    return false;
  }

  console.log("Email sent:", data);
  return true;
};

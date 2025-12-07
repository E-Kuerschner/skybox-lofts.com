import type { AppLoadContext } from "react-router";
import { sendEmail } from "./sendEmail.server";
import { welcomeEmail } from "./templates";

export const sendInviteEmail = async (
  ctx: AppLoadContext,
  email: string,
  firstName: string,
  name: string,
) => {
  const baseURL = import.meta.env.DEV
    ? "http://localhost:5173"
    : "https://skybox-lofts.com";
  const loginPageUrl = `${baseURL}/resident/login`;
  const message = welcomeEmail(firstName || name, loginPageUrl);

  if (import.meta.env.PROD) {
    await sendEmail(ctx, email, "Welcome to Skybox Lofts!", message);
  } else {
    console.log(`
      ========================================
      INVITE EMAIL
      ========================================
      To: ${email}
      Name: ${firstName || name}
      Login URL: ${loginPageUrl}
      ========================================
    `);
  }
};

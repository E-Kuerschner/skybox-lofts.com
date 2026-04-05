import { sendEmail } from "./sendEmail.server";
import { welcomeEmail } from "./templates";

export const sendInviteEmail = async (
  env: Env,
  email: string,
  firstName: string,
  name: string,
) => {
  const loginPageUrl = `${env.BETTER_AUTH_URL}/resident/login`;
  const message = welcomeEmail(firstName || name, loginPageUrl);
  await sendEmail(env, email, "Welcome to Skybox Lofts!", message);
};

import type { AppLoadContext } from "react-router";
import { eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDatabase } from "~/util/database.server";
import { sendEmail } from "~/email/sendEmail.server";
import { welcomeEmail, signInEmail } from "~/email/templates";
import * as schema from "../../database/schema";
import {
  makeOptions,
  type MagicLinkFunction,
  type SendVerificationEmailFunction,
} from "./options";

export const USER_NOT_FOUND = "User not found";

export function getAuth(ctx: AppLoadContext) {
  const db = getDatabase(ctx);

  const sendMagicLink: MagicLinkFunction = async ({ email, url }, request) => {
    if (import.meta.env.DEV) {
      console.log(`
            ========================================
            MAGIC LINK EMAIL
            ========================================
            To: ${email}
            Verification URL: ${url}
            ========================================
      `);
    } else {
      const existingUser = await db
        .select()
        .from(schema.users)
        // TODO SQL injection???
        .where(eq(schema.users.email, email))
        .get(); // .get() returns single record or undefined

      if (!existingUser) {
        throw new Error(USER_NOT_FOUND);
      }

      const message = signInEmail(existingUser.name, url);
      await sendEmail(
        ctx,
        email,
        "Here is your one-time sign in link",
        message,
      );
    }
  };

  const sendVerificationEmail: SendVerificationEmailFunction = async ({
    user,
    url,
  }) => {
    if (import.meta.env.DEV) {
      console.log(`
        ========================================
        VERIFICATION EMAIL
        ========================================
        To: ${user.email}
        Name: ${user.name}
        Verification URL: ${url}
        ========================================
      `);
    } else {
      const message = welcomeEmail(user.name, url);
      await sendEmail(ctx, user.email, "Welcome to Skybox Lofts!", message);
    }
  };

  const auth = betterAuth({
    ...makeOptions({
      sendMagicLink,
      sendVerificationEmail,
    }),
    secret: ctx.cloudflare.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      usePlural: true,
      schema,
    }),
  });

  return auth;
}

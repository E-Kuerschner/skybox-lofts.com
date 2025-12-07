import type { AppLoadContext } from "react-router";
import { eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDatabase } from "~/util/database.server";
import { sendEmail } from "~/email/sendEmail.server";
import { signInEmail } from "~/email/templates";
import * as schema from "../../database/schema";
import {
  makeOptions,
  type MagicLinkFunction,
  defaultSendMagicLink,
} from "./options";
import type { CustomUserFields } from "./types";

export const USER_NOT_FOUND = "User not found";

export function getAuth(ctx: AppLoadContext) {
  const db = getDatabase(ctx);

  const sendMagicLink: MagicLinkFunction = async ({ email, url }, request) => {
    if (import.meta.env.PROD) {
      const existingUser = await db
        .select()
        .from(schema.users)
        // TODO SQL injection???
        .where(eq(schema.users.email, email))
        .get(); // .get() returns single record or undefined

      if (!existingUser) {
        throw new Error(USER_NOT_FOUND);
      }

      const customUser = existingUser as typeof existingUser & CustomUserFields;
      const message = signInEmail(
        customUser.firstName || existingUser.name,
        url,
      );
      await sendEmail(
        ctx,
        email,
        "Here is your one-time sign in link",
        message,
      );
    }
  };

  const auth = betterAuth({
    ...makeOptions({
      sendMagicLink: (args) => {
        if (import.meta.env.DEV) {
          defaultSendMagicLink(args);
        }

        return sendMagicLink(args);
      },
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

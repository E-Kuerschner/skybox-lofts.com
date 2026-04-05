import type { AppLoadContext } from "react-router";
import { eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDatabase } from "~/util/database.server";
import { sendEmail } from "~/email/sendEmail.server";
import { signInEmail } from "~/email/templates";
import * as schema from "../../database/schema";
import { createPlugins, userAdditionalFields } from "../../database/auth.config";
import type { CustomUserFields } from "./types";

export const USER_NOT_FOUND = "User not found";

export function getAuth(ctx: AppLoadContext) {
  const db = getDatabase(ctx);
  const auth = betterAuth({
    baseURL: ctx.cloudflare.env.BETTER_AUTH_URL,
    secret: ctx.cloudflare.env.BETTER_AUTH_SECRET,
    plugins: createPlugins({
      sendMagicLink: async ({ email, url }) => {
        const existingUser = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email))
          .get();

        if (!existingUser) {
          throw new Error(USER_NOT_FOUND);
        }

        const customUser = existingUser as typeof existingUser & CustomUserFields;
        const name = customUser.firstName || existingUser.name;
        await sendEmail(ctx.cloudflare.env, email, "Here is your one-time sign in link", signInEmail(name, url));
      },
    }),
    user: {
      additionalFields: userAdditionalFields,
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 1, // one day
      },
    },
    database: drizzleAdapter(db, {
      provider: "sqlite",
      usePlural: true,
      schema,
    }),
  });

  return auth;
}

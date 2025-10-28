import type { AppLoadContext } from "react-router";
import { eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDatabase } from "~/util/database.server";
import * as schema from "../../database/schema";
import { makeOptions, type MagicLinkFunction } from "./options";

export const USER_NOT_FOUND = "User not found";

export function getAuth(ctx: AppLoadContext) {
  const db = getDatabase(ctx);

  const sendMagicLink: MagicLinkFunction = async ({ email, url }, request) => {
    const existingUser = await db
      .select()
      .from(schema.users)
      // TODO SQL injection???
      .where(eq(schema.users.email, email))
      .get(); // .get() returns single record or undefined

    if (!existingUser) {
      throw new Error(USER_NOT_FOUND);
    }

    // TODO send email if in production
  };

  const auth = betterAuth({
    ...makeOptions({
      sendMagicLink: (...args) => {
        // need a way to view the URL in development mode without sending an email
        // for some reason console.logs inside the sendMagicLink function are being swallowed
        if (import.meta.env.DEV) {
          console.log(args);
        }

        sendMagicLink(...args);
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

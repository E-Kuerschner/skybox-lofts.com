import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { AppLoadContext } from "react-router";

import * as schema from "../../database/schema";
import { options } from "./options";
import { getDatabase } from "~/util/database.server";

export function getAuth(ctx: AppLoadContext) {
  const db = getDatabase(ctx);
  const auth = betterAuth({
    ...options,
    secret: ctx.cloudflare.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      usePlural: true,
      schema,
    }),
  });

  return auth;
}

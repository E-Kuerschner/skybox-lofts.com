import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import type { AppLoadContext } from "react-router";

import * as schema from "../../database/schema";
import { options } from "./options";
import { anonymous } from "better-auth/plugins";

export function getAuth(ctx: AppLoadContext) {
  const db = drizzle(ctx.cloudflare.env.APP);
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

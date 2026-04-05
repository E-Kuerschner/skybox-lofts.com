#!/usr/bin/env bun

/*
  This file is ONLY used by the @better-auth/cli!
  Since the CLI is only used for generating schema definitions (see database/authSchema.ts), no specific database needs to be referenced.
  BETTER_AUTH_SECRET is also unnecessary because this instance's API is never invoked in application logic.

  Helpful guide: https://hono.dev/examples/better-auth-on-cloudflare
 */
import { drizzle } from "drizzle-orm/d1";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { createPlugins, userAdditionalFields } from "./database/auth.config";

import * as schema from "./database/schema";

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  plugins: createPlugins(),
  user: { additionalFields: userAdditionalFields },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 1,
    },
  },
  database: drizzleAdapter(
    drizzle(
      "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/de771219e24b62731a77124e9b884ba49d9f86f804f98f6914c83bc973571688.sqlite",
    ),
    {
      provider: "sqlite",
      usePlural: true,
      schema,
    },
  ),
});

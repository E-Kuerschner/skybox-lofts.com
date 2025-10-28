#!/usr/bin/env bun

/*
  This file is ONLY used by the @better-auth/cli!
  It shares common BetterAuthOptions with the server's BetterAuth instance.
  Since the CLI is only used for generating schema definitions (see database/authSchema.ts), no specific database needs to be referenced.
  BETTER_AUTH_SECRET is also unnecessary for this instance of BetterAuth because it's api will never be invoked in application business logic.

  Helpful guide: https://hono.dev/examples/better-auth-on-cloudflare
 */
import { drizzle } from "drizzle-orm/d1";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { makeOptions } from "./app/auth/options";

import * as schema from "./database/schema";

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  ...makeOptions({}),
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

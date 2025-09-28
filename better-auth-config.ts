#!/usr/bin/env bun

/*
  This file is ONLY used by the @better-auth/cli!
  It shares common BetterAuthOptions with the server's BetterAuth instance.
  Since the CLI is only used for generating schema definitions (see database/authSchema.ts), no specific database needs to be referenced.
  BETTER_AUTH_SECRET is also unnecessary for this instance of BetterAuth because it's api will never be invoked in application business logic.

  Helpful guide: https://hono.dev/examples/better-auth-on-cloudflare
 */
import { drizzle } from "drizzle-orm/bun-sqlite";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { options } from "./app/auth/options";

import * as schema from "./database/schema";

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  ...options,
  database: drizzleAdapter(drizzle(), {
    provider: "sqlite",
    usePlural: true,
    schema,
  }),
});

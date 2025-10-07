import { drizzle } from "drizzle-orm/d1";
import type { AppLoadContext } from "react-router";

export function getDatabase(context: AppLoadContext) {
  return drizzle(context.cloudflare.env.APP, { casing: "snake_case" });
}

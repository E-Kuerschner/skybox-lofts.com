/**
 * Shared auth schema configuration — single source of truth for schema-affecting config.
 *
 * Used by both:
 * - better-auth-config.ts (CLI stub for schema generation)
 * - app/auth/index.ts (runtime config)
 */
import { anonymous, admin, magicLink } from "better-auth/plugins";

type MagicLinkSender = Parameters<typeof magicLink>[0]["sendMagicLink"];

type CreatePluginsParams = {
  sendMagicLink?: MagicLinkSender;
};

/**
 * Creates the plugins array with optional runtime implementations.
 * Add/remove plugins here — both CLI and runtime will stay in sync.
 */
export function createPlugins({ sendMagicLink }: CreatePluginsParams = {}) {
  return [
    admin(),
    anonymous(),
    magicLink({
      disableSignUp: true,
      sendMagicLink: sendMagicLink ?? (async () => {}),
    }),
  ];
}

/**
 * Custom fields added to the user table.
 * AGENTS.md: custom fields must be added here, never via raw migration scripts.
 */
export const userAdditionalFields = {
  unitNumber: {
    type: "number",
    required: true,
    defaultValue: 0,
  },
  firstName: {
    type: "string",
    required: false,
  },
  lastName: {
    type: "string",
    required: false,
  },
} as const;

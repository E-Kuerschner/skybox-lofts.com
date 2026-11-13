/**
 * Shared auth schema configuration — single source of truth for schema-affecting config.
 *
 * Used by both:
 * - better-auth-config.ts (CLI stub for schema generation)
 * - app/auth/index.ts (runtime config)
 */
import { admin, magicLink } from "better-auth/plugins";

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
    magicLink({
      disableSignUp: true,
      sendMagicLink: sendMagicLink ?? (async () => {}),
    }),
  ];
}

/**
 * Custom fields added to the user table.
 * AGENTS.md: custom fields must be added here, never via raw migration scripts.
 *
 * Better Auth lets a signed-in user set any field on their own account through
 * POST /api/auth/update-user unless the field has `input: false`. Give every new
 * field `input: false` unless residents are meant to change it themselves.
 * Admin edits write to the database directly, so they are not affected.
 */
export const userAdditionalFields = {
  unitNumber: {
    type: "number",
    required: true,
    defaultValue: 0,
    input: false,
  },
  firstName: {
    type: "string",
    required: false,
    input: false,
  },
  lastName: {
    type: "string",
    required: false,
    input: false,
  },
  // Email preference: general communications (announcements, new site features, etc.)
  // Residents change this themselves on the Preferences page, so it stays user-settable.
  receivesGeneralEmails: {
    type: "boolean",
    required: true,
    defaultValue: true,
  },
} as const;

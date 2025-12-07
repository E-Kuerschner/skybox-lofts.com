import type { BetterAuthOptions } from "better-auth";
import { anonymous, admin, magicLink } from "better-auth/plugins";

export type MagicLinkFunction = Parameters<
  typeof magicLink
>[number]["sendMagicLink"];

type Options = {
  sendMagicLink?: MagicLinkFunction;
};

export const defaultSendMagicLink: MagicLinkFunction = async ({
  email,
  url,
}) => {
  console.log(`
    ========================================
    MAGIC LINK EMAIL
    ========================================
    To: ${email}
    Verification URL: ${url}
    ========================================
  `);
};

export const makeOptions = ({
  sendMagicLink = defaultSendMagicLink,
}: Options) =>
  ({
    // TODO move to env vars?
    baseURL: import.meta.env.DEV
      ? "http://localhost:5173"
      : "https://skybox-lofts.com",
    plugins: [
      admin(),
      anonymous({
        // onLinkAccount: async ({ anonymousUser, newUser }) => {
        //   // perform actions like moving the cart items from anonymous user to the new user
        // },
      }),
      magicLink({
        disableSignUp: true,
        sendMagicLink,
      }),
    ],
    session: {
      // session stored in cookie to prevent frequently hitting database
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 1, // one day
      },
    },
    user: {
      additionalFields: {
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
      },
    },
  }) satisfies BetterAuthOptions;

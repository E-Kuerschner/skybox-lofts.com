import type { BetterAuthOptions } from "better-auth";
import { anonymous, admin, magicLink } from "better-auth/plugins";

export type MagicLinkFunction = Parameters<
  typeof magicLink
>[number]["sendMagicLink"];

type Options = {
  sendMagicLink?: MagicLinkFunction;
};

const defaultSendMagicLink: MagicLinkFunction = ({ email, url }) => {
  console.log(`${email}: ${url}`);
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
  }) satisfies BetterAuthOptions;

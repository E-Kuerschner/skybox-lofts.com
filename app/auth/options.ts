import type { BetterAuthOptions } from "better-auth";
import { anonymous, admin, magicLink } from "better-auth/plugins";

export type MagicLinkFunction = Parameters<
  typeof magicLink
>[number]["sendMagicLink"];

export type SendVerificationEmailFunction = NonNullable<
  BetterAuthOptions["emailVerification"]
>["sendVerificationEmail"];

type Options = {
  sendMagicLink?: MagicLinkFunction;
  sendVerificationEmail?: SendVerificationEmailFunction;
};

const defaultSendMagicLink: MagicLinkFunction = ({ email, url }) => {
  console.log(`${email}: ${url}`);
};

const defaultSendVerificationEmail: SendVerificationEmailFunction = async ({
  user,
  url,
}) => {
  console.log(`Verification email for ${user.email}: ${url}`);
};

export const makeOptions = ({
  sendMagicLink = defaultSendMagicLink,
  sendVerificationEmail = defaultSendVerificationEmail,
}: Options) =>
  ({
    // TODO move to env vars?
    baseURL: import.meta.env.DEV
      ? "http://localhost:5173"
      : "https://skybox-lofts.com",
    emailVerification: {
      sendOnSignUp: false, // We'll manually trigger for invited users
      sendVerificationEmail,
    },
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

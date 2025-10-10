import type { BetterAuthOptions } from "better-auth";
import { anonymous, admin } from "better-auth/plugins";

export const options = {
  plugins: [
    admin(),
    anonymous({
      // onLinkAccount: async ({ anonymousUser, newUser }) => {
      //   // perform actions like moving the cart items from anonymous user to the new user
      // },
    }),
  ],
  session: {
    // session stored in cookie to prevent frequently hitting database
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 1, // one day
    },
  },
} satisfies BetterAuthOptions;

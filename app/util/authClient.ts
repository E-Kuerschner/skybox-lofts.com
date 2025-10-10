import { createAuthClient } from "better-auth/react";
import { anonymousClient, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient(), anonymousClient()],
});

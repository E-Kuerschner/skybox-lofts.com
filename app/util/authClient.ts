import { createAuthClient } from "better-auth/react";
import {
  anonymousClient,
  adminClient,
  magicLinkClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient(), anonymousClient(), magicLinkClient()],
});

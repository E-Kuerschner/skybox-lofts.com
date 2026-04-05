# Email

## How it works

### Sending an email

```ts
import { sendEmail } from "~/email/sendEmail.server";
import { myTemplate } from "~/email/templates";

await sendEmail(env, to, subject, myTemplate(/* args */));
```

In **development**, `sendEmail` logs the template's `debugMessage` to stdout instead of sending anything. In **production**, it sends via [Resend](https://resend.com).

### Defining a template

Every template must return an `EmailTemplate`:

```ts
import type { EmailTemplate } from "~/email/emailTemplate";

export const myTemplate = (arg: string): EmailTemplate => ({
  html: `<p>Hello ${arg}</p>`,
  debugMessage: `
========================================
MY EMAIL
========================================
Arg: ${arg}
========================================
  `,
});
```

The `html` field is sent in production. The `debugMessage` field is logged in development. Both are required — omitting either is a type error.

## Files

| File | Purpose |
|------|---------|
| `emailTemplate.ts` | `EmailTemplate` type definition |
| `sendEmail.server.ts` | `sendEmail()` — handles dev/prod branching |
| `templates.ts` | All transactional email templates |
| `sendInviteEmail.server.ts` | Wrapper for the resident invite flow |

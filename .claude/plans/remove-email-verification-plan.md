# Plan: Reframe Email Verification to Invitation Flow

## Overview
Transform the current email verification feature into a cleaner invitation flow. Since Better Auth's magic link already sets `emailVerified = true` on first login, we can remove the explicit verification step and frame emails as invitations instead.

## Key Insight
Better Auth's magic link plugin automatically sets `emailVerified: true` when users successfully sign in via magic link (both for new and existing unverified users). This means the verification step is redundant - the first login serves as verification.

## Changes Required

### 1. Update Email Template
**File:** `app/email/templates.ts`

Update `welcomeEmail()` function:
- Remove all mentions of "verify your email address"
- Reframe as an invitation to access their account
- Change CTA button text from "Verify Email Address" to "Sign In Now"
- Update link destination from verification endpoint to sign-in page (`/resident/login`)
- Keep the friendly, welcoming tone
- Emphasize that they can sign in whenever they want

**Current focus:** Email verification
**New focus:** Account invitation with immediate access

### 2. Remove Better Auth Email Verification Configuration
**File:** `app/auth/options.ts`

Remove the `emailVerification` configuration block entirely:
```typescript
emailVerification: {
  autoSignInAfterVerification: true,
  sendOnSignUp: false,
  sendVerificationEmail,
}
```

This removes Better Auth's verification plugin from the auth setup.

### 3. Create New Invite Email Sending Method
**File:** `app/auth/index.ts`

Remove the `sendVerificationEmail` function (currently lines 50-60) since it's tied to Better Auth's verification plugin.

Create a new standalone function: `sendInviteEmail(ctx, email, firstName, name)` that:
- Calls the updated `welcomeEmail()` template
- Passes the login page URL instead of a verification URL
- Uses the existing `sendEmail()` helper
- Can be called independently (not as a Better Auth plugin hook)

### 4. Update Resident Creation Flow
**File:** `app/routes/ResidentManagement/index.tsx`

Replace the Better Auth verification API call (lines 141-147):
```typescript
await auth.api.sendVerificationEmail({
  body: {
    email,
    callbackURL: "/resident?verified=1",
  },
});
```

With a direct call to the new `sendInviteEmail()` function:
- Import the new function from `app/auth/index.ts`
- Call it after user creation succeeds
- Pass user's email, firstName, and name

### 5. Update ResidentManagement UI Wording
**Files to update:**

**`app/routes/ResidentManagement/ResidentRegistrationDialog.tsx` (lines 68-73)**
- Change: "They will receive a welcome email with a link to verify their email and set up their account."
- To: "They will receive a welcome email with instructions to sign in and access their account."

**`app/routes/ResidentManagement/MobileUserDrawer.tsx` (lines 88-92)**
- Change: "They will receive a welcome email with a link to verify their email."
- To: "They will receive a welcome email with instructions to sign in and access their account."

**`app/routes/ResidentManagement/index.tsx` (lines 447-450)**
- Current wording is fine, no changes needed ("Grant new residents access...")

### 6. Remove Verified Success Banner
**File:** `app/routes/ResidentHome.tsx`

Remove the success banner logic (lines 20-28) that shows "Thank you! Your email has been verified." since there's no longer a verification callback with `?verified=1` parameter.

### 7. Keep Pending/Verified Status Display
**File:** `app/routes/ResidentManagement/ResidentCard.tsx`

**NO CHANGES** - Keep the existing Pending/Verified badge logic (lines 40-46). This still accurately reflects whether a user has logged in for the first time:
- "Pending" = User invited but hasn't logged in yet (`emailVerified = false`)
- "Verified" = User has logged in at least once (`emailVerified = true`)

The magic link flow will automatically update this status on first login.

## Implementation Order

1. Update email template (`app/email/templates.ts`)
2. Create new `sendInviteEmail()` function in `app/auth/index.ts`
3. Remove Better Auth email verification config from `app/auth/options.ts`
4. Update resident creation flow in `app/routes/ResidentManagement/index.tsx`
5. Update UI wording in ResidentManagement components
6. Remove verification success banner from `app/routes/ResidentHome.tsx`
7. Test the flow end-to-end

## Files to Modify

1. `app/email/templates.ts` - Reframe email template
2. `app/auth/index.ts` - Remove old function, add new invite sender
3. `app/auth/options.ts` - Remove emailVerification config
4. `app/routes/ResidentManagement/index.tsx` - Update email sending call
5. `app/routes/ResidentManagement/ResidentRegistrationDialog.tsx` - Update wording
6. `app/routes/ResidentManagement/MobileUserDrawer.tsx` - Update wording
7. `app/routes/ResidentHome.tsx` - Remove success banner

## Testing Checklist

After implementation:
- [ ] Create a new resident account
- [ ] Verify invite email is sent with new wording
- [ ] Confirm CTA button links to `/resident/login`
- [ ] Test magic link login sets emailVerified flag
- [ ] Verify ResidentCard shows "Pending" → "Verified" transition
- [ ] Confirm no verification success banner appears
- [ ] Test typecheck passes (`bun run typecheck`)

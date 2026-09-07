# A single pattern for admin-gated CRUD

**Status:** proposal. The primitives described here exist in the tree and the
contractors feature is built on them. Nothing else has been migrated yet — the
follow-up work is listed at the end.

## Why this document exists

Three features in the app let an admin create, update or delete something that
residents can see: **documents**, **board members** and **resident management**.
All three solved the same problem — "how do we let admins change this without
letting residents change it" — and all three solved it differently. Contractors
would have been the fourth. This settles on one answer so it doesn't become the
fifth.

The scope here is deliberately narrow: **authorization and the interface
affordances around it**. Layout is not standardized and should not be — see
[What this pattern does *not* cover](#what-this-pattern-does-not-cover).

## Where we are today

| | Documents | Board members | Resident management |
| --- | --- | --- | --- |
| Where mutations live | Two top-level resource routes (`/documentUpload`, `/documentDelete`) | The page's own `action`, dispatched on `intent` | The page's own `action`, dispatched on `intent` |
| Server check | `isAdmin(…, { returnUnauthorized: true })` → throws 403 | Inline `session.user.role !== "admin"` → returns `{ error }` | `isAdmin()` in the **loader** → redirects to `/resident` |
| What a non-admin sees on refusal | A blank 403 error screen | A friendly banner | Silently bounced off the page |
| How admin controls appear | Always visible when `isAdmin` | Behind a "Make changes" toggle | The whole page is admin-only, so no gating |
| Result shape | `{ success, message }` / `{ success, error }` | `{ success, message }` / `{ error }` | `{ success, message }` / `{ error }` |
| How results are shown | Local state + a `key` counter to restart the auto-dismiss timer | Two `<StatusBanner>`s and an `"success" in actionData` narrowing | Local state + `useEffect` |

### What that costs us

1. **The same situation produces three different experiences.** A resident who
   ends up posting to an admin-only endpoint gets a blank 403 on documents, a
   readable explanation on board members, and a silent redirect on residents.
   Only one of those is acceptable for an audience we've agreed is
   non-technical.
2. **`isAdmin` is re-derived in every loader.** Each page has to remember to
   return it, and each component has to remember to thread it down. Forget it in
   the loader and the control disappears for real admins; forget the check in
   the action and the control works for everyone.
3. **Two different admin affordances.** Documents shows its controls all the
   time; board members hides them behind a toggle. An admin has to learn each
   page separately, and always-visible destructive controls are a mis-tap risk
   on mobile.
4. **Three result shapes mean three lots of banner glue.** Every page reinvents
   "show the message, restart the dismiss timer, narrow the union".
5. **No rule for where a mutation lives.** Documents put them in top-level
   resource routes; the others used the page's action. Both work; having both
   means every new feature re-litigates it.

## The pattern

Six rules. The first four are the ones that matter.

### 1. One result shape

`app/util/crud/actionResult.ts`

```ts
type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };
```

Every create/update/delete returns this. Nothing else. Messages are written for
residents, not for us: say what happened and what to do next.

### 2. One server guard: `runAdminAction`

`app/util/crud/adminAction.server.ts`

```ts
export async function action({ request, context }: Route.ActionArgs) {
  return runAdminAction(
    { request, context },
    { create: createContractor, update: updateContractor, delete: deleteContractor },
  );
}
```

It handles the three refusal cases the same way everywhere:

- **Not signed in** → 401, caught by the route error boundary. There's no
  friendly copy for someone with no session; they need to log in.
- **Signed in, not an admin** → a normal `ActionResult` error the page renders
  in plain language. This is the case that actually matters, because most people
  using the site are residents.
- **Anything unexpected** → logged with the intent name for us, generic apology
  for them.

Handlers are keyed by the form's `intent` field and receive `{ request, context,
formData, session, db }`, so a handler is just business logic.

### 3. Mutations live in the feature's own route action

Dispatched by `intent`. Resource routes are reserved for things that genuinely
aren't form posts — streaming a file back (`documentDownload`,
`contractorPhoto`). This keeps a feature's server logic in one place and means
`useFetcher()` posts to the current route with no `action` prop to keep in sync.

### 4. One admin affordance: the edit-mode toggle

`app/components/AdminEditing.tsx` provides `AdminEditingProvider`,
`AdminEditToggle`, `AdminOnly` and `useIsAdmin()`.

```tsx
<AdminEditingProvider>
  …
  <AdminEditToggle />          {/* "Make changes" / "Done" — renders nothing for residents */}
  <AdminOnly>
    <Button onClick={openEditForm}>Edit</Button>
  </AdminOnly>
</AdminEditingProvider>
```

Residents always see a clean, read-only page. An admin sees one button; only
after pressing it do edit and delete controls appear.

Why this rather than always-visible controls:

- On every shared page the majority of viewers are residents, so read-only is
  the right default state.
- It puts a deliberate step in front of destructive controls, which matters most
  on a phone where an "Edit" and a "Remove" button sit a thumb-width apart.
- It's one switch to learn, in the same place, on every page — which is exactly
  what lets pages look completely different from each other without the admin
  having to relearn anything. Board members already works this way; this makes
  it the rule rather than one page's choice.

**The exception:** a page that is *entirely* admin-only (resident management,
activity log) has no residents to protect and needs no toggle. Gate those in the
loader with `isAdmin()` and let every control be visible. The toggle is for
**mixed-audience pages** only.

### 5. One source of client-side admin truth

`useIsAdmin()` reads `isAdmin` from the resident layout's loader data. Page
loaders stop returning it, and components stop threading it through props. There
is one place to get it wrong instead of one per feature.

### 6. One feedback component

`<ActionStatusBanner result={fetcher.data} />` renders any `ActionResult`.
Success auto-dismisses; errors stay, because an error is still something the
person needs to act on.

## What this pattern does *not* cover

Worth stating plainly, because the point is that features should be free to look
different:

- **Layout and visual design.** Cards, tables, accordions, grids, maps — all
  fair game. Contractors is a filterable card grid with a map; documents is an
  accordion of file lists. They share no design and shouldn't.
- **How editing is presented.** Inline editing, a dialog, a drawer, a separate
  page — whatever suits the data. Only the *entry point* (the toggle) is fixed.
- **Validation rules, copy, or data modelling.** Per feature.
- **Whether a feature needs an edit mode at all.** Admin-only pages don't.

## What contractors already does

Built on all six rules, so it needs no follow-up refactor:

- `app/routes/Contractors/index.tsx` — loader returns no `isAdmin`; action is a
  three-line `runAdminAction` dispatch.
- `app/routes/Contractors/contractors.server.ts` — handlers return
  `ActionResult` and nothing else.
- The page is wrapped in `AdminEditingProvider`; "Add contractor" and the per-card
  Edit/Remove buttons sit inside `<AdminOnly>`.
- Feedback goes through `<ActionStatusBanner>`.
- `/resident/contractors/photo` is a resource route because it streams bytes,
  not because it mutates anything.

## Follow-up work

Not done here, roughly in order of value-to-risk. Each is independently
shippable.

1. **Board members** — closest to the pattern already. Replace the inline role
   check with `runAdminAction`, normalize the two result shapes to
   `ActionResult`, swap the hand-rolled edit toggle for `AdminEditToggle`, and
   drop `isAdmin` from the loader in favour of `useIsAdmin()`. Low risk.
2. **Documents** — the bigger change. Move `/documentUpload` and
   `/documentDelete` into an `intent`-dispatched action on
   `/resident/documents`; keep `/resident/documents/download` as a resource
   route. Put the upload button and the per-file delete buttons behind
   `AdminOnly`. While in there, decide what to do about the upload button being
   `hidden md:flex` — either make uploading work on mobile or tell the admin why
   it's unavailable rather than hiding it silently.
3. **Resident management** — keep the loader-level `isAdmin()` gate (it's an
   admin-only page, the exception above). Adopt `ActionResult` and
   `ActionStatusBanner` so the feedback code matches everywhere else.
4. **Remove `isAdmin` from page loaders** once `useIsAdmin()` is in use, so
   there's only one place it comes from.
5. **Consider logging activity inside `runAdminAction`.** Right now each handler
   inserts its own `activityLogs` row and it's easy to forget one. The wrapper
   knows the intent, the session and the outcome; it could log automatically if
   handlers returned the entity type and id. Worth doing once a fourth feature
   needs it — the `EntityType` union in `activityLogger.server.ts` is already
   growing by hand.

## Open questions

- Should a non-admin see admin controls **disabled with an explanation**, rather
  than hidden? Hidden is cleaner and is what this proposes, but disabled makes
  it discoverable that changes are possible at all.
- Should `runAdminAction` support non-admin intents on the same route (e.g. a
  resident-submitted suggestion), or should those get their own action?
- Do we want optimistic UI on any of these? None of them have it today and the
  operations are fast enough that it may not be worth the complexity.

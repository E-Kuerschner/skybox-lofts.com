# How admins change things: a shared interaction pattern

**Status:** proposal. The contractors feature is built on it. Nothing else has
been migrated — follow-up work is listed at the end.

This is about **interaction design**, not architecture. The question it answers
is: when a page is read by residents and occasionally edited by an admin, how do
the editing controls appear, behave, and confirm? A short appendix covers the
server-side helpers, because one of the rules below has a server half.

## Where we are today

Three features let an admin change something residents can see, and each answers
the question differently.

| | Documents | Board members | Resident management |
| --- | --- | --- | --- |
| Getting to the controls | Always visible | Press **"Make changes"** first | Always visible |
| Create affordance | "Upload Document" button, top right — `hidden md:flex`, so it silently doesn't exist on a phone | n/a | "Invite resident" button |
| Per-item control | A bare 🗑 icon next to the file's own download link | The row's text turns into a combobox | Inline on the card |
| Destructive confirm | `window.confirm()` — browser chrome, not the app | An in-app overlay | An in-app overlay |
| Exiting | n/a | Press **"Done"** | n/a |

### What's wrong with each

**The edit mode (board members).** You named this one and I think the instinct
is right. Three specific things make it feel off:

1. **"Done" is a lie.** Nothing was batched. Each assignment already saved the
   moment it was confirmed. The button says "commit your changes" and actually
   means "hide the controls again" — so the one moment the page feels like it
   should reassure you, it's describing something that already happened.
2. **It's a mode**, and modes have to be remembered. You come back to the tab
   five minutes later and the page looks different from how you left it with no
   explanation of why.
3. **It's page-wide state for a per-item intention.** You wanted to change *the
   Treasurer*. You had to change *the page*. On a three-row table the cost is
   small; on a card grid the switch is at the top and the card you want is three
   screens down.

**The bare trash icon (documents).** A destructive, unlabeled control sitting
directly beside the link a resident taps to download the file. On a phone those
are a thumb-width apart. `window.confirm()` is the only thing between a mis-tap
and a deleted building document, and it's a browser dialog that looks nothing
like the rest of the site — which trains people to dismiss it without reading.

**The invisible upload button (documents).** `hidden md:flex` means an admin on
a phone gets no button and no explanation. From their side the feature is just
missing.

**Resident management is fine.** It's an admin-only page, so there are no
residents to protect and nothing to hide.

## The pattern

### Rule 1 — No modes. Admin controls are always visible to admins.

If you can do it, you can see it. No switch to find, no state to remember, no
extra press before every action.

The objection to this is clutter, and it's a real one — but clutter comes from
*scattering* controls through the content, not from their existence. Rule 2
handles that.

*Narrow exception:* a flow where several changes are genuinely batched and
committed together (reordering a list, a multi-step form) does need a mode,
because there really is something to save and to cancel. None of our features
are that today.

### Rule 2 — An item's controls live in one separated area of that item.

A card gets a quiet row across its bottom. A table row gets a trailing cell. Not
interleaved with the content, and never adjacent to something a resident taps on
purpose.

This is what buys back the tidiness the mode was protecting: the read view stays
readable because the controls are in a predictable gutter, not sprinkled beside
the things they act on.

`<AdminItemActions>` in `app/components/AdminOnly.tsx` is that area.

### Rule 3 — Label controls with words, not icons alone.

"Edit" and "Remove", not ✏️ and 🗑. Our admins are volunteer board members, not
people who have absorbed the meaning of a `⋮`. An unlabeled destructive icon is
the worst case of all — the control that most needs to be understood is the one
carrying the least information.

(I considered a `⋮` overflow menu per item, the convention in Notion/Drive/Linear.
Rejected for this audience: it hides the actions behind a glyph you have to
already know, and adds a press to reach a two-item menu.)

### Rule 4 — One create affordance, in the page header, never hidden by breakpoint.

Labeled with the noun — "Add contractor", "Upload document" — not "Add" or "+".
If something genuinely can't work on a phone, say so in place of the button
instead of removing it silently.

### Rule 5 — Creating and editing always happen in a modal.

Never an inline row that turns into inputs, never a separate page. One place to
look, one shape to learn, and the list stays on screen behind it so you keep
your bearings.

This is the rule with the most leverage, because we already have several of
these forms and will keep adding them. `<CrudFormDialog>` exists so a feature
only writes the part that is actually its own — the fields. See
[the appendix](#appendix-the-shared-components).

### Rule 6 — Destructive actions always confirm in the app, naming the thing.

An in-app overlay, never `window.confirm()` — browser chrome the site has no
control over, which people learn to dismiss without reading. Name the item, say
what else goes with it, and label the buttons with verbs: "Remove contractor" /
"Keep it", not "OK" / "Cancel". `<ConfirmActionDialog>` does this.

### Rule 7 — Feedback appears in one place, in one style.

One banner at the top of the page for every outcome. Success dismisses itself;
errors stay, because an error is still something the person has to act on.
`<ActionStatusBanner>`.

### Rule 8 — A resident who trips an admin action gets a sentence, not an error screen.

This is the rule with a server half. Today the same situation produces a blank
403 on documents, a readable banner on board members, and a silent bounce off
the page on residents. It should always be the readable banner. Being signed out
is different and should send you to sign in.

## What this pattern does *not* cover

Deliberately, because features should look different from each other:

- **Layout and visual design.** Cards, tables, accordions, grids, maps. Contractors
  is a filterable card grid with a map; documents is an accordion of file lists.
  They share no design and shouldn't.
- **How editing itself is presented** — inline, dialog, drawer, separate page.
  Only the *entry point* is standardized.
- **Validation, copy, data modelling.** Per feature.

## What contractors does

- "Add contractor" sits in the page header, always visible to admins, labeled.
- Every card carries an `<AdminItemActions>` row with **Edit** and **Remove**,
  always visible to admins, separated by a divider from the card's content and
  from the card's own tap target.
- Adding and editing both happen in a `<CrudFormDialog>`; removing opens a
  `<ConfirmActionDialog>` naming the business and warning that its photos go too.
- One `<ActionStatusBanner>` at the top of the page.
- A non-admin who posts to the action gets a sentence explaining it's
  admin-only; a signed-out request gets a 401.

There is no edit mode. An earlier draft of this document proposed one and
contractors was built on it; both were changed after the mode was (rightly)
called awkward.

## Follow-up work

Each is independently shippable.

1. **Documents** — the most user-visible win. Replace the bare 🗑 with a labeled
   "Remove" in a trailing control group, swap `window.confirm()` for
   `<ConfirmActionDialog>`, move the upload form into a `<CrudFormDialog>`, and
   either make mobile upload work or explain its absence instead of
   `hidden md:flex`. Its two resource routes would fold into an
   `intent`-dispatched action on `/resident/documents`.
2. **Board members** — drop "Make changes"/"Done". Give each row a trailing
   "Change" control that opens a `<CrudFormDialog>` directly. The combobox moves
   into the modal rather than replacing the row's text, so the table stays
   readable at all times.
3. **Resident management** — no interaction changes needed; align its feedback on
   `<ActionStatusBanner>` for consistency.
4. **Normalize the refusal path** (Rule 8) across all three.

## Open questions

**Decided:** residents do not see admin controls in any form — not disabled,
not greyed out. They are not rendered. A control you cannot use is noise on a
page you are trying to read.

- Board members' combobox-in-the-row is the one place where read and edit
  representations genuinely differ. Moving it into an overlay is my
  recommendation, but it's the weakest fit for these rules and worth a look
  together.

---

## Appendix: the shared components

Everything here lives in `app/components/crud/`. The point is that a new CRUD
feature writes its *fields* and its *server handlers*, and nothing else.

### `<CrudFormDialog>` — the create/edit modal

```tsx
<CrudFormDialog
  open={open}
  onOpenChange={setOpen}
  mode={record ? "edit" : "create"}
  entityName="contractor"
  recordId={record?.id}
  hasFileUploads
  onSuccess={showSuccess}
  submitDisabled={!isComplete}
>
  {/* just the fields */}
</CrudFormDialog>
```

It owns everything that was being rewritten per feature:

| It handles | So a feature never writes |
| --- | --- |
| Responsive shell (dialog on desktop, sheet on mobile) | `ResponsiveOverlay` wiring, titles, descriptions |
| The `intent` and `recordId` hidden fields | Per-feature field names |
| Its own `useFetcher` | Threading a fetcher down and working out which overlay a result belongs to |
| Errors inside the form, successes handed up via `onSuccess` as it closes | Close-on-success effects |
| Ignoring a result from before it opened | The "stale banner on reopen" bug, per feature |
| Disabling the form while saving, via a `fieldset` | `disabled={isSubmitting}` on **every** input |
| Remounting on a different `recordId` | Resetting uncontrolled fields by hand |
| Cancel / submit footer with pending copy | Button rows and "Saving…" labels |

Two details worth knowing. **Disabling is done with a wrapping `<fieldset>`**,
which disables every control inside it for free — that alone removed a
`disabled` prop from a dozen inputs in the contractor form. And **the form is
keyed on `recordId`**, so opening it on a different record remounts it and the
browser resets `defaultValue` fields; only state a feature holds in React needs
resetting by hand.

### `<ConfirmActionDialog>` — the yes/no sibling

Same lifecycle, for deletes. Exists so nothing reaches for `window.confirm()`.

### `useStatusBanner()`

The dialogs close themselves on success, so the confirmation needs somewhere to
land. `const { banner, showSuccess } = useStatusBanner()` — render `{banner}` at
the top of the page and pass `showSuccess` as `onSuccess`.

### The form contract

Every CRUD form posts `intent` (`create` | `update` | `delete`) and, when
editing or deleting, `recordId`. Handlers read those two names, not
`contractorId` or `documentKey`, so a handler written for one feature reads the
same as the next.

## Appendix: the server-side helpers

Rule 8 needs consistent server behaviour, so there are two small helpers. They
are a **convenience, not a mandate** — the rule is the behaviour, not the helper.

**`ActionResult`** (`app/util/crud/actionResult.ts`) — the shape a mutation
returns: `{ success: true, message } | { success: false, error }`. This exists so
`<ActionStatusBanner>` can render any outcome without per-page glue.

**`runAdminAction`** (`app/util/crud/adminAction.server.ts`) — about thirty lines
that do exactly four things: check the session, map "signed in but not an admin"
to a readable `ActionResult`, look up a handler by the form's `intent`, and
catch-and-log anything unexpected.

**It does not centralize business logic.** Contractors' handlers are ordinary
per-resource functions — `createContractor`, `updateContractor`,
`deleteContractor` in `contractors.server.ts` — each with its own validation,
service resolution, R2 handling and activity logging. The wrapper never sees any
of it; it hands the handler `{ request, context, formData, session, db }` and
returns whatever comes back. Bespoke logic per resource is the expected case.

**When not to use it.** Write the action directly and call `isAdmin()` yourself
if you need to:

- return something that isn't an `ActionResult` (a redirect, a file, a specific
  status code);
- serve both admin and resident intents from one route, since the wrapper
  rejects the whole request for non-admins;
- handle the request body yourself — it calls `request.formData()` eagerly, so
  streaming or manual parsing doesn't fit.

In those cases keep Rule 8's *behaviour* (401 signed out, readable message for a
non-admin, logged generic message for a crash) and skip the helper.

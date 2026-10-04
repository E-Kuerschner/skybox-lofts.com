# Shared CRUD pieces

Infrastructure for "an admin changes something": a create/edit modal, a confirm
dialog, and a status banner, plus the two server helpers in `app/util/crud/`.

**The reasoning behind all of it lives in [`docs/admin-crud-pattern.md`](../../../docs/admin-crud-pattern.md)** —
the eight interaction rules, why there is no edit mode, and when *not* to reach
for these. Read that first if you're deciding how an admin surface should
behave. This file is the short version: what's here and how to wire it up.

## The pieces

| File | What it is |
| --- | --- |
| `CrudFormDialog.tsx` | The create/edit modal. Owns the responsive shell, the hidden `intent`/`recordId` fields, its own fetcher, close-on-success, and disabling the form while saving. Also exports `CRUD_INTENT_FIELD` / `CRUD_RECORD_ID_FIELD`. |
| `ConfirmActionDialog.tsx` | The yes/no sibling, for deletes. Exists so nothing reaches for `window.confirm()`. |
| `ActionStatusBanner.tsx` | `<ActionStatusBanner>` renders one `ActionResult`. `useStatusBanner()` is the page-level version for confirmations that must outlive the dialog that caused them. |
| `~/util/crud/actionResult.ts` | `ActionResult` — the one shape every mutation returns — plus `actionSuccess`, `actionError`, `isActionResult`. |
| `~/util/crud/adminAction.server.ts` | `runAdminAction` — checks the session, turns "signed in but not an admin" into a readable result, and dispatches on `intent`. |

Admin-only *visibility* is separate: see `~/components/AdminOnly` for
`<AdminOnly>`, `<AdminItemActions>` and `useIsAdmin()`.

## The contract

Every form posts **`intent`** (`create` | `update` | `delete`) and, when editing
or deleting, **`recordId`**. The dialogs write those fields themselves. Handlers
read those two names — never `contractorId` or `documentKey` — so a handler
written for one feature reads like the next one.

Every handler returns an `ActionResult`, which is what lets the banners render
any outcome without per-page glue.

## Wiring up a new page

`app/routes/Contractors/` is the reference implementation. End to end it is:

**1. The route action dispatches by intent.**

```ts
export async function action({ request, context }: Route.ActionArgs) {
  return runAdminAction(
    { request, context },
    { create: createThing, update: updateThing, delete: deleteThing },
  );
}
```

**2. Handlers are ordinary per-resource functions.** `runAdminAction` hands each
one `{ request, context, formData, session, db }` and returns whatever comes
back. Validation, file handling and activity logging stay yours:

```ts
export async function createThing({ formData, db, session }: AdminActionArgs) {
  const fields = parseFields(formData);
  if (!fields.ok) return actionError(fields.error);
  // ...insert, log...
  return actionSuccess(`${fields.value.name} was added.`);
}
```

**3. The page owns the banner and the open/close state.**

```tsx
const { banner, showSuccess } = useStatusBanner();
// render {banner} anywhere in the page — it positions itself as a floating
// toast so it never shifts the layout underneath it
```

**4. The form dialog wraps just the fields.**

```tsx
<CrudFormDialog
  open={isFormOpen}
  onOpenChange={setIsFormOpen}
  mode={record ? "edit" : "create"}
  entityName="thing"
  recordId={record?.id}
  onSuccess={showSuccess}
>
  {/* just the inputs — no disabled props, no fetcher, no submit button */}
</CrudFormDialog>
```

**5. Deletes confirm in-app, naming the thing and its consequences.**

```tsx
<ConfirmActionDialog
  open
  onOpenChange={(open) => !open && setToDelete(null)}
  title="Remove this thing?"
  intent="delete"
  recordId={toDelete.id}
  confirmLabel="Remove thing"
  cancelLabel="Keep it"
  destructive
  onSuccess={showSuccess}
>
  <span className="font-medium text-foreground">{toDelete.name}</span> will no
  longer show up. This can't be undone.
</ConfirmActionDialog>
```

## Two things that trip people up

- **Errors stay in the dialog, successes bubble up.** A failed save renders
  inside the form that caused it, where the fields still are. A successful one
  closes the dialog and is handed to the page via `onSuccess`, because by then
  the dialog is gone.
- **The form is keyed on `recordId`.** Opening it on a different record remounts
  it, so uncontrolled `defaultValue` fields reset for free. Only state you hold
  in React needs resetting yourself, in an effect on `open`.

## Adoption

Contractors is currently the only page using these. Documents, Board Members and
Resident Management still have bespoke forms and confirmations — see the
follow-up list in `docs/admin-crud-pattern.md`. The helpers are a convenience,
not a mandate; that document's "When not to use it" section covers the cases
where writing the action directly is the right call.

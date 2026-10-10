# Contractors & service providers

A directory of businesses the building has vetted, at `/resident/contractors`.
Every signed-in resident can browse it. The add/edit controls follow the
interaction pattern in [admin-crud-pattern.md](./admin-crud-pattern.md): no edit
mode, an "Add" button beside the job list, and Edit/Remove controls on each
listing — always visible to the people who can use them, hidden from everyone
else.

## Who can change what

| | Admin | Owner | Renter |
| --- | --- | --- | --- |
| Add to the in-unit list | yes | yes | no |
| Add building service providers | yes | no | no |
| Choose which list(s) a listing is in | yes | no | no |
| Edit or remove a listing | any | only ones they added | no |

Each listing records who added it in `contractors.created_by`. Listings added
before that column existed have no creator, so only admins can change them.
When an owner edits their listing it stays in whichever list(s) it's already in
— an admin may have added it to the building service providers as well.

The loader works out `canManage` for each listing on the server, so the page
never sees who added what; the action re-checks it on every submit. Every add,
edit and removal — by an owner or an admin — is written to the activity log.

## Two tabs

- **Unit contractors** — businesses residents can hire for work in their own
  unit.
- **Building service providers** — the businesses that look after the building
  itself. The board handles these contacts, so this tab tells residents they
  shouldn't need to reach out themselves. Photos aren't shown here.

Each listing has an `isUnitContractor` and an `isBuildingService` flag, and they
are independent: a plumber can be the building's riser vendor and someone a
resident hires for their own sink, so it appears on both tabs. At least one must
be set — the action rejects a listing with neither, since it would appear
nowhere.

## What a listing holds

| Field | Required | Notes |
| --- | --- | --- |
| Business or owner name | yes | |
| Phone / email | **one of the two** | Enforced in the action, not just the form |
| Website | no | |
| Address | no | Free-form. Shown as a Google Maps link. Not every contractor has a public address |
| Services offered | yes, at least one | Picked from the shared service list — see below |
| Good to know | no | Free-form note, e.g. "Ask for Dana. Mention you're a resident." Who to ask for goes here too |
| Photos | no | Up to 6, 5MB each, JPG/PNG/WEBP/GIF |

## Finding a contractor

Residents are looking for a *job*, not a business name, so each tab is built
around services rather than an alphabetical list:

- A **job list** (beside the listings on desktop, along the top on mobile) shows
  each service with how many businesses offer it. Services with nobody behind
  them are left out — an empty choice is a dead end.
- Results are **grouped under a heading per service**. A business that offers
  three services appears under all three, so someone looking for a painter sees
  every painter under that heading without reading each listing to check.
- A **search box** matches business names, service names **and the Good to know
  notes**. Notes record what the building actually uses a business for, so
  typing "sprinkler" or "tuckpointing" finds the right contractor even though
  those aren't service names.

## Services are a shared list

Services live in their own table (`contractor_services`) joined many-to-many to
contractors, rather than as free text on the contractor row. That's what makes
grouping and filtering trustworthy — without it "AC repair", "A/C Repair" and
"ac repair" become three separate headings and the browse-by-service view slowly
falls apart.

The contractor form only lets admins pick services already on the list, which
keeps it tidy. Names are kept short and broad (e.g. "Heating & Cooling", "Fire
Safety"); the specifics of what a business does for the building go in its Good
to know notes.

## Data model

`database/schema.ts`:

- `contractors` — the listing.
- `contractor_services` — the service list. `slug` is unique.
- `contractor_service_links` — join table, composite primary key.
- `contractor_photos` — one row per photo; the bytes live in R2, only the key is
  stored here.

The tables come from migration `0010_lumpy_ikaris.sql`, produced with
`drizzle-kit generate`.

## Seeding the directory

The service list and the building's current providers are loaded by
`database/seeds/contractor-directory.sql`. It's data rather than schema, so it
isn't a migration: `database/seeds/` is gitignored and the script is run by hand
once per environment, **after** migrations have been applied:

```bash
wrangler d1 execute app --local  --file=database/seeds/contractor-directory.sql
wrangler d1 execute app --remote --file=database/seeds/contractor-directory.sql
```

It's safe to re-run, but it only adds what's missing — it never updates or
removes existing contractors or services.

## Photos

Photos go to a **separate R2 bucket** so they stay clear of the documents bucket,
whose objects are all written with an attachment `Content-Disposition`.

**Setup needed before this deploys** — the bucket must exist in the Cloudflare
account, or the deploy fails:

```bash
wrangler r2 bucket create contractor-photos
```

Or in the dashboard: Storage & databases → R2 Object Storage → Create bucket,
named exactly `contractor-photos`. The bucket stays private. The binding is
already in `wrangler.jsonc` as `CONTRACTOR_PHOTOS`.

They're served through `/resident/contractors/photo?id=<photoId>`, which requires
a session. Photos are looked up **by database id, not by an R2 key from the
URL**, so a signed-in person can only fetch objects the app actually recorded
rather than probing the bucket by guessing keys.

Deleting a contractor, or removing a photo while editing, deletes the R2 object
and the row together.

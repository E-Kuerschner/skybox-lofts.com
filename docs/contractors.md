# Approved contractors

A directory of contractors the building has vetted, at `/resident/contractors`.
Every signed-in resident can browse it; only admins can add, edit or remove
listings. The admin controls follow the interaction pattern in
[admin-crud-pattern.md](./admin-crud-pattern.md): no edit mode, "Add contractor"
in the page header, and a labeled Edit/Remove row on each card — all visible to
admins at all times, all hidden from residents.

## What a listing holds

| Field | Required | Notes |
| --- | --- | --- |
| Business or owner name | yes | |
| Person to ask for | no | The owner or main contact |
| Phone / email | **one of the two** | Enforced in the action, not just the form |
| Address | no | Free-form, geocodable. Not every contractor has a public address |
| Services offered | yes, at least one | From a shared catalog — see below |
| Good to know | no | Free-form note, e.g. "mention you're a resident" |
| Photos | no | Up to 6, 5MB each, JPG/PNG/WEBP/GIF |

## Finding a contractor

Residents are looking for a *job*, not a business name, so the page is built
around services rather than an alphabetical list:

- A **search box** matches business names, contact names, notes **and service
  names**, so typing "balcony" finds the painters.
- **Service chips** across the top, each showing how many businesses offer it.
  Services with nobody behind them are left out — an empty chip is a dead end.
- **"By service"** (the default) groups the results under a heading per service.
  A contractor that offers three services appears under all three. That
  repetition is the point: someone looking for balcony painting should see every
  painter under that heading without reading each listing to check.
- **"By name"** switches to a single A–Z list for when they already know who
  they're looking for.

## Services are a shared catalog

Services live in their own table (`contractor_services`) joined many-to-many to
contractors, rather than as free text on the contractor row. That's what makes
grouping and filtering trustworthy — without it "AC repair", "A/C Repair" and
"ac repair" become three separate chips and the browse-by-service view slowly
falls apart.

Admins can still add one from the contractor form ("Something not on the list?").
New names are matched to the catalog **by slug** first, so typing "AC repair"
when "AC Repair" already exists reuses the existing entry instead of creating a
near-duplicate.

The starting catalog of 19 common jobs is seeded in
`database/migrations/0010_seed-contractor-services.sql`.

## Data model

`database/schema.ts`:

- `contractors` — the listing, plus nullable `latitude`/`longitude` for the map.
- `contractor_services` — the catalog. `slug` is unique.
- `contractor_service_links` — join table, composite primary key.
- `contractor_photos` — one row per photo; the bytes live in R2, only the key is
  stored here.

Migrations: `0009_outgoing_may_parker.sql` (tables) and
`0010_seed-contractor-services.sql` (catalog seed). Both were produced with
`drizzle-kit generate`, and both apply cleanly against a fresh local D1.

## Photos

Photos go to a **separate R2 bucket** so they stay clear of the documents bucket,
whose objects are all written with an attachment `Content-Disposition`.

**Setup needed before this deploys:**

```bash
wrangler r2 bucket create contractor-photos
```

The binding is already in `wrangler.jsonc` as `CONTRACTOR_PHOTOS`.

They're served through `/resident/contractors/photo?id=<photoId>`, which requires
a session. Photos are looked up **by database id, not by an R2 key from the
URL**, so a signed-in person can only fetch objects the app actually recorded
rather than probing the bucket by guessing keys.

Deleting a contractor, or removing a photo while editing, deletes the R2 object
and the row together.

## Google Maps — not finished

Blocked on the browser key. What's in place:

- `app/util/googleMaps.server.ts` reads `GOOGLE_MAPS_API_KEY` and returns `null`
  when it isn't set.
- The directory-level map panel (`ContractorMap`) renders a friendly "the map is
  on its way" placeholder, so the layout is already the right shape.
- Each listing's detail view shows a **plain Google Maps link** today, which
  needs no key at all, and switches to the Maps Embed API iframe once a key
  exists.
- `latitude`/`longitude` columns exist and are deliberately **cleared whenever an
  address changes**, so a future geocoding step knows what needs re-resolving.

**When you have the key:**

1. Add `GOOGLE_MAPS_API_KEY` to `.dev.vars` for local dev and
   `wrangler secret put GOOGLE_MAPS_API_KEY` for production.
2. `wrangler types` picks up `.dev.vars`, so also add the key to the mock env in
   `tests/helpers/context.ts` — that file uses `satisfies Env` and will fail
   typecheck otherwise. (Every secret in this project needs that pair of edits.)
3. Follow the `TODO(google-maps)` block at the top of
   `app/routes/Contractors/ContractorMap.tsx` for the remaining work: load the
   Maps JavaScript API client-side, drop a marker per contractor with
   coordinates, geocode on save so those columns get filled, and select a
   contractor in the list when its marker is clicked.

It's a browser key, so it is meant to be visible to the client. Restrict it by
HTTP referrer in the Google Cloud console rather than trying to hide it.

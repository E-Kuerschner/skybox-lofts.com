# Design System Conventions

This document records the semantic tokens and styling conventions established by the
2026-07 design system audit. All colors, radii and shadows in the app should be expressed
through these tokens and shared components — never through raw palette utilities
(`text-emerald-600`), arbitrary hex values (`bg-[#6e927e]`) or one-off class combinations.

## Color tokens

Defined in `app/app.css` (`:root` + `@theme inline`) and used as normal Tailwind
utilities (`bg-primary`, `text-success`, `border-secondary/40`, …).

| Token | Value | Use for |
| --- | --- | --- |
| `primary` | emerald-600 | Brand green: primary/CTA buttons, links, active nav, focus rings, text selection, brand emphasis |
| `primary-light` | emerald-300 | Brand green text sitting **on the dark banner image** (breadcrumbs, user name in header) |
| `secondary` | `#c17d42` terracotta | Secondary action buttons, warm decorative accents |
| `success` | emerald-700 | Positive status: success banners, "Verified"/"Created" labels |
| `destructive` | red | Errors, delete actions |
| `card` | white | Any solid white surface (panels, sidebar, inputs that need an opaque background) — never `bg-white` |
| `muted` / `muted-foreground` | neutral grays | Supporting text, subtle backgrounds |
| `border` / `input` / `accent` | neutral grays | Borders, input outlines, hover fills |

Opacity modifiers derive the rest: tinted fills are `<token>/5`–`/10`, soft borders are
`<token>/30`–`/40` (e.g. StatusBanner uses `bg-success/10 border-success/40 text-success`).

Exceptions that intentionally keep literal colors:
- `WrigleyClock.tsx` and the SVG logos (fixed brand illustrations).
- `app/email/templates.ts` (HTML email requires inline hex; `#059669` there is emerald-600 = `primary`).

## Utilities (app.css)

- `site-bg` — the stone→neutral page-background gradient. Single source of truth; used by
  `html/body`, the public home page, overlays and ContentCard.
- `link` — inline text links: `text-primary hover:underline cursor-pointer`.
- `frosted-glass` — blurred translucent backdrop for content over imagery.

## Surfaces & elevation

| Layer | Recipe |
| --- | --- |
| Form controls | `rounded-md` + `shadow-xs` (shadcn defaults) |
| Cards, list rows, page panels | `rounded-xl` (Card) / `rounded-lg` (nested rows) + `shadow-sm` |
| Overlays (Dialog, Sheet, standalone login card) | `shadow-lg` |
| CTA button | `shadow-lg hover:shadow-xl` + lift (the one intentionally elevated control) |

Shared components:
- **`Panel`** (`app/components/Panel.tsx`) — the white content panel wrapping every
  resident page (`bg-card rounded-xl border px-4 pt-4 pb-8 shadow-sm`). Do not re-create
  this wrapper with raw divs.
- **`ContentCard`** — decorative Card variant for the resident home page.
- **`StatusBanner`** — the only success/error message treatment (supports `autoDismiss`).
  Never hand-roll green/red message boxes.
- **`SearchInput`** — pill-shaped search field, used anywhere search is offered.

## Buttons

Variants in `app/components/ui/button.tsx`, all token-based:
- `default` — solid `primary` green; the standard action button.
- `cta` — `default` plus elevation/lift, for the single most important action on a page.
- `secondary` — terracotta, for prominent-but-secondary admin actions.
- `destructive`, `outline`, `ghost`, `link`, `icon` — standard shadcn roles.

## Typography

Inter (`--font-sans`) everywhere. Scale in use:
- Page titles (resident layout header): `text-2xl md:text-4xl font-semibold`
- Marketing hero (public home): `text-3xl md:text-5xl font-bold`
- Section/card titles: `text-xl font-semibold`
- Body: default size; supporting text `text-sm text-muted-foreground`; fine print `text-xs`

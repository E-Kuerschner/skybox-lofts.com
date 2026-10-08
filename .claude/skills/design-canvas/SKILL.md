---
name: design-canvas
description: Use whenever making design explorations, mockups, artboards or a Design canvas/artifact of a Skybox Lofts page, dialog or component (e.g. "redesign the X page", "give me 3 explorations", "capture the current state"). Makes every artboard sit inside the app's real shell (sidebar, banner header, dialog frame) captured from the running dev server, so only the content being designed changes.
---

# Designing Skybox Lofts pages on a canvas

The person cares that mockups look like the real app. Everything outside the
area being designed (sidebar, banner header, breadcrumbs, the `<main>` padding,
the dialog frame, fonts and colors) must be **captured from the running app**,
never re-drawn from reading the code. Creative liberty applies only to the
content being designed: what goes inside `<main>`, or the body of a dialog.

## 1. Capture from the dev server, not the code

1. Make sure the dev server is up on http://localhost:5173 (`.claude/launch.json`
   has a `dev` entry that puts Node 24 on PATH; start it with `preview_start`
   name `dev`). Open the page you're redesigning, signed in as an admin.
2. **CSS:** download the compiled stylesheet and upload it to the canvas as an
   asset, then link it in every artboard's `<head>` right after `support.js`:
   ```bash
   curl -s "http://localhost:5173/app/app.css?direct" -o <scratchpad>/app-built.css
   ```
   Tailwind only compiles classes used somewhere in `app/`, so before using a
   class in an artboard, `grep -F` the downloaded CSS for it; fall back to an
   inline style when it's missing.
3. **Shell:** run `capture-shell.js` (this folder) in the browser on that page
   with the browser's javascript tool. It returns the shell with the app's real
   classes and three placeholders: `__LOGO__`, `__BANNER__`, `__CONTENT__`.
   `shell.html` here is a capture from 2026-10-08 (Documents page, admin) and
   can be reused if the shell hasn't changed. Re-capture whenever the layout,
   nav or header has changed, or when designing a different page. The page
   title, breadcrumb and active nav item differ per page.
4. Upload `app/components/text-logo.svg` and `public/banner.jpg` as canvas
   assets and swap them in for `__LOGO__` / `__BANNER__`.
5. **Current state boards:** capture `document.querySelector('main').innerHTML`
   (and any open `[role=dialog]`'s outerHTML) from the live page instead of
   rebuilding it. Strip `data-discover`, `radix-*` ids, `aria-controls`,
   inline `--radix-*` styles and `value=""` attributes, and point `href`s at `#`.

## 2. Build the artboards

- Page artboards: the captured shell, with the design inside `__CONTENT__`.
  Wrap new content in `<div class="design-content">` and scope any helmet
  CSS to `.design-content` (unlayered CSS in a helmet beats the app's
  Tailwind layers, so an unscoped `a { color }` repaints the sidebar nav).
- Don't load extra web fonts. The app sets Inter in its font stack but
  doesn't load it, so artboards should render with the same fallback as the
  real app.
- Dialog artboards: a full 1280×900 screen (390×844 for phone) that
  `<dc-import>`s the page artboard underneath, then the real overlay
  (`fixed inset-0 z-50 bg-black/15`) and the real `ResponsiveOverlay` frame:
  content box classes, header bar, `OverlayBody`, `OverlayFooter` and
  `ActionButton` classes. Capture them from an open dialog on the dev
  server. The same markup becomes the bottom sheet at phone width through
  its `max-md:` classes.
- Match existing patterns for anything shared across pages. Delete
  confirmations use `ConfirmActionDialog`: "Remove this X?", the item's name
  in `font-medium text-foreground`, "Keep it" / "Remove X".

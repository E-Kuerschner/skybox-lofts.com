# Skybox Lofts Resident Portal

A full-stack resident portal for Skybox Lofts, built with React Router v7 and deployed on Cloudflare Workers. It provides residents with a login-protected area for community documents, announcements, and more.

## Prerequisites

- [Bun](https://bun.sh) — used as the package manager and development runtime
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) — Cloudflare's deployment tool (installed automatically with dependencies)
- A Cloudflare account with access to the project's Workers, D1 database, and R2 buckets (see [Cloudflare Infrastructure](#cloudflare-infrastructure) below)

## Local Development

### 1. Install dependencies

```bash
bun install
```

### 2. Set up environment variables

Copy the example environment file and fill in your values:

```bash
cp .dev.vars.example .dev.vars
```

See [Environment Variables](#environment-variables) for what each value is and where to get it.

### 3. Set up the local database

```bash
bun run db:migrate:local
```

To also seed an initial admin user:

```bash
bun run db:reset:local
```

### 4. Start the development server

```bash
bun run dev
```

The app will be available at `http://localhost:5173`.

> In development, emails (magic links, invitations) are not sent — they are printed to the terminal instead.

## Environment Variables

Copy `.dev.vars.example` to `.dev.vars` and fill in your values for local development. This file is gitignored and should never be committed.

Variables fall into two categories:

### Worker secrets

These are needed both in `.dev.vars` for local development **and** must be set in the Cloudflare Worker for production (see [Updating Worker secrets](#updating-worker-secrets)).

| Variable | What | Why |
|---|---|---|
| `BETTER_AUTH_SECRET` | A random 32-character secret. Generate with `openssl rand -base64 32`. | Signs and verifies all authentication tokens. **Keep this value stable** — changing it logs every resident out. |
| `BETTER_AUTH_URL` | Base URL of the app (`http://localhost:5173` locally, `https://skybox-lofts.com` in production). | Included in magic link emails so the link points to the right domain. |
| `RESEND_KEY` | API key from [Resend](https://resend.com). | Authenticates with Resend to send magic link login emails and resident invitations. |
| `CONTACT_US_EMAIL` | An email address you control. | Destination for contact form submissions from the public-facing site. |
| `ENVIRONMENT` | `development` or `production`. | Tells the app which environment it's running in. |

### Local / Wrangler CLI only

These are only needed in `.dev.vars` on your local machine. They authenticate the Wrangler CLI so it can run migrations and access Cloudflare resources — they are not used by the Worker at runtime.

| Variable | What | Why |
|---|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID, found in the dashboard sidebar. | Tells Wrangler which account to target. |
| `CLOUDFLARE_ACCOUNT_TOKEN` | A Cloudflare API token with D1 and R2 read/write permissions. Create one at Cloudflare Dashboard → My Profile → API Tokens. | Authenticates Wrangler CLI commands (migrations, deployments) with Cloudflare. |
| `CLOUDFLARE_DATABASE_ID` | The ID of the D1 database, found at Cloudflare Dashboard → D1 → `app`. | Used by Drizzle migration scripts to target the correct database. |

## Testing

Run the full test suite:

```bash
bun run test
```

Use `bun run test` rather than a bare `bun test`: the script adds `--isolate`, which stops one test file's `mock.module()` fakes from leaking into other files.

Run tests in watch mode during development:

```bash
bun run test:watch
```

Tests live in the `tests/` directory and use Bun's built-in test runner with [MSW](https://mswjs.io/) for HTTP mocking. They run against an in-memory SQLite database — no running server or Cloudflare account required.

> Some tests exercise error paths that log to the console (e.g. Resend errors). This output is expected and does not indicate a test failure.

## Type Checking

```bash
bun run typecheck
```

This generates Cloudflare Workers types, React Router types, and then runs the TypeScript compiler.

## Building and Deploying

Build for production:

```bash
bun run build
```

Deploy to Cloudflare Workers:

```bash
bun run deploy
```

To upload a version for review before making it live:

```bash
bunx wrangler versions upload
```

Then promote it to production or roll it out progressively:

```bash
bunx wrangler versions deploy
```

## Database Migrations

Migrations are managed with [Drizzle ORM](https://orm.drizzle.team). **Never create migration files by hand** — always use the generator:

```bash
bun run db:generate   # generates migration files from schema changes
```

Apply them to your local database:

```bash
bun run db:migrate:local
```

### Production

Production migrations run in CI. You don't run them by hand. The [Migrate workflow](.github/workflows/migrate.yml) runs `bun run db:migrate` against the production D1 database on every push to `main`, so merging a PR that adds a migration is what applies it. Runs are queued one at a time so two never touch the database at once. The job uses the `production` GitHub environment, where the Cloudflare secrets are stored and where required reviewers can be added to gate migrations.

The workflow applies migrations with drizzle-kit rather than `wrangler d1 migrations apply`. Production tracks applied migrations in drizzle's `__drizzle_migrations` table. Wrangler keeps its own separate list and would treat every migration as not yet applied.

## Agentic Development

This project is set up for working with AI coding agents. The preferred harness is [Claude Code](https://claude.com/claude-code) (CLI, desktop app or IDE extension); the configuration below is written for it.

### Project instructions

`CLAUDE.md` points to [`AGENTS.md`](AGENTS.md), which holds the conventions agents follow: Bun only, Tailwind theme variables instead of raw colors, PascalCase component files, plain language for residents, generated (never hand-written) migrations, and so on. When a convention changes, update `AGENTS.md` so every agent session picks it up. Longer write-ups an agent should read before touching an area live in `docs/` (e.g. [`docs/admin-crud-pattern.md`](docs/admin-crud-pattern.md)).

### What's in `.claude/`

| Path | What it does |
|---|---|
| `hooks/setup-worktree-db.sh` | Sets up a local database in new worktrees (see [Hooks](#hooks)). |
| `settings.json` | Shared permissions and hooks. Common safe commands are pre-approved, and `bun run db:migrate` (production) and `bun run deploy` are **denied**, so an agent can never touch production. Personal overrides go in `settings.local.json`, which is gitignored. |
| `launch.json` | How to start the dev server (`bun run dev` with Node 24 on the PATH, which Wrangler needs). The desktop app's preview browser uses it. |
| `skills/design-canvas/` | How to make design mockups that sit inside the app's real shell, captured from the running dev server. |
| `skills/react-router-framework-mode/` | Reference for React Router v7 routes, loaders, actions and forms. |
| `agents/dev-server-debugger.md` | A sub-agent that tests features in the running dev server through a browser. |

### Worktrees and `.worktreeinclude`

Claude Code can run each task in its own git worktree under `.claude/worktrees/`, so several agents can work in parallel without stepping on each other. A new worktree only contains tracked files, so gitignored ones like `.dev.vars` are missing, and signing in fails with an "Invalid URL string" error because `BETTER_AUTH_URL` is unset.

[`.worktreeinclude`](.worktreeinclude) fixes that: it lists gitignored files (using `.gitignore` syntax) that Claude Code copies from your main checkout into every new worktree. It currently copies `.dev.vars`. Worktrees created before a file was listed won't have it; copy it in by hand from the main checkout.

The local database (`.wrangler/`) is deliberately not copied, so each worktree starts with a clean one. The hook below sets it up.

### Hooks

Hooks are scripts Claude Code runs on its own at set moments. They're registered in `.claude/settings.json` and live in `.claude/hooks/`.

#### `setup-worktree-db.sh`: a ready-to-use database in every new worktree

Runs when a Claude Code session starts (not when one is resumed or cleared). The first time that happens in a new worktree, it:

1. Checks that it's in a worktree with no local database yet. In your main checkout, or in a worktree that already has a database, it stops straight away, so your data is never touched.
2. Puts Node 24 on the PATH if nvm has it (Wrangler needs it), and runs `bun install` if `node_modules` is missing.
3. Runs `bun run db:reset:local`, which creates the database, applies every migration without asking for confirmation, and adds an admin user you can sign in with.

This takes a few seconds. The hook never stops a session from starting: if something it needs is missing or the setup fails, it tells Claude what to do at the start of the session, and the full output is in `.wrangler/worktree-setup.log`.

Claude Code has no hook for "after a worktree is created". Its `WorktreeCreate` hook replaces how worktrees are made entirely, and turns off `.worktreeinclude`, so this hook runs at session start and checks for itself whether there's anything to do.

### Tips

- **Signing in as an agent:** emails aren't sent in development, so an agent reads the magic link from the dev server's terminal output (see [Local Development](#local-development)).
- **Only one dev server on port 5173 at a time.** Stop the one in another worktree before starting a new one, or the agent will be looking at the wrong code.
- **Check the work like any other PR:** run `bun run test` and `bun run typecheck`, and look at UI changes in the browser before merging.
- **Never put secrets in prompts, `AGENTS.md`, skills or committed settings.** They belong in `.dev.vars` and the Worker's secrets.

## Cloudflare Infrastructure

The app runs entirely on Cloudflare's infrastructure. Here is what is in use and what a new maintainer needs access to in order to take over the project.

### What runs in Cloudflare

| Resource | Type | Name | Purpose |
|---|---|---|---|
| `skybox-lofts` | Workers | — | Serverless runtime that serves the entire application |
| `app` | D1 Database | `app` | SQLite database storing user accounts, sessions, documents, and other application data |
| `documents` | R2 Bucket | `documents` | Object storage for uploaded resident documents (PDFs, etc.) |
| `contractor-photos` | R2 Bucket | `contractor-photos` | Object storage for photos on contractor listings |
| `skybox-lofts.com` | Custom Domain | — | Public domain routed through Cloudflare to the Worker |

### What a new maintainer needs

To take over operation of this site, you will need to either be added as a member of the existing Cloudflare account or have the resources transferred to a new account. Specifically:

1. **Cloudflare account access** — Ask the current maintainer to add you as an Administrator at Cloudflare Dashboard → Account → Members, or have them transfer the domain and resources to your own Cloudflare account.

2. **The `BETTER_AUTH_SECRET` value** — This secret signs all authentication tokens. You must get the current value from the existing maintainer. If it is lost, you can generate a new one, but all residents will be logged out and will need to log back in.

3. **A Resend account** — The app uses [Resend](https://resend.com) to send emails (magic link logins, resident invitations). The current Resend API key is stored in `.dev.vars` locally and as a secret in the Cloudflare Worker environment. You will need either access to the existing Resend account or to create your own and update the `RESEND_KEY` secret in the Worker settings.

4. **GitHub repository access** — The source code lives here. The current maintainer can transfer repository ownership under GitHub Settings → Transfer repository, or add you as an Admin collaborator.

5. **Domain registrar access** — `skybox-lofts.com` is managed through Cloudflare's domain registrar. This is covered under account access (item 1 above) if the domain was registered through Cloudflare.

### Updating Worker secrets

Production secrets (like `RESEND_KEY` and `BETTER_AUTH_SECRET`) are stored in the Cloudflare Worker, not in this repository. To update them:

```bash
bunx wrangler secret put RESEND_KEY
bunx wrangler secret put BETTER_AUTH_SECRET
```

You can also manage them through the Cloudflare dashboard under Workers → `skybox-lofts` → Settings → Variables and Secrets.

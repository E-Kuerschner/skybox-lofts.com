# Skybox Lofts Resident Portal

A full-stack resident portal for Skybox Lofts, built with React Router v7 and deployed on Cloudflare Workers. It provides residents with a login-protected area for community documents, announcements, and more.

## Prerequisites

- [Bun](https://bun.sh) — used as the package manager and development runtime
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) — Cloudflare's deployment tool (installed automatically with dependencies)
- A Cloudflare account with access to the project's Workers, D1 database, and R2 bucket (see [Cloudflare Infrastructure](#cloudflare-infrastructure) below)

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
| `APP_SECRET` | Any long random string. | Additional signing secret used by the application. |
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
bun test
```

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
bun run db:migrate    # applies migrations to the remote Cloudflare D1 database
```

For local development only:

```bash
bun run db:migrate:local
```

## Cloudflare Infrastructure

The app runs entirely on Cloudflare's infrastructure. Here is what is in use and what a new maintainer needs access to in order to take over the project.

### What runs in Cloudflare

| Resource | Type | Name | Purpose |
|---|---|---|---|
| `skybox-lofts` | Workers | — | Serverless runtime that serves the entire application |
| `app` | D1 Database | `app` | SQLite database storing user accounts, sessions, documents, and other application data |
| `documents` | R2 Bucket | `documents` | Object storage for uploaded resident documents (PDFs, etc.) |
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

# Skybox Lofts

A full-stack resident portal built with React Router v7, deployed on Cloudflare Workers.

## Getting Started

### Installation

Install the dependencies:

```bash
bun install
```

### Development

Start the development server with HMR:

```bash
bun run dev
```

Your application will be available at `http://localhost:5173`.

### Database (local)

Set up and seed the local D1 database:

```bash
bun run db:migrate:local
```

## Testing

Run the full test suite:

```bash
bun test
```

Run tests in watch mode during development:

```bash
bun run test:watch
```

Tests live in the `tests/` directory and use Bun's built-in test runner with [MSW](https://mswjs.io/) for HTTP mocking. The test suite covers route actions and server-side utilities with an in-memory SQLite database — no running server required.

Note: Some tests exercise error paths that log to the console (e.g. Resend errors). This output is expected and does not indicate a failure.

## Building for Production

Create a production build:

```bash
bun run build
```

## Deployment

Deployment is done using the Wrangler CLI.

To build and deploy directly to production:

```sh
bun run deploy
```

To deploy a preview URL:

```sh
bunx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
bunx wrangler versions deploy
```

## Type Checking

```bash
bun run typecheck
```

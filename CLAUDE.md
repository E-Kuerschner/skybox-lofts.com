# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack React Router v7 application for Skybox Lofts, deployed on Cloudflare Workers. The project uses:

- **Bun** for development runtime & scripting
- **React Router v7** with server-side rendering
- **Cloudflare Workers** for serverless deployment
- **Drizzle ORM** with SQLite/D1 database
- **Better Auth** for authentication
- **TailwindCSS** for styling
- **TypeScript** throughout

## Development Commands

```bash
# Development server with HMR
bun run dev

# Type checking (generates Cloudflare types + React Router types + TypeScript check)
bun run typecheck

# Build for production
bun run build

# Preview production build locally
bun run preview

# Deploy to Cloudflare Workers
bun run deploy

# Generate Cloudflare Workers types
bun run cf-typegen
```

## Architecture

### File Structure
- `app/` - React Router application code
  - `routes/` - Page routes
  - `components/` - Reusable React components
- `Database/` - Database migrations and Drizzle configuration & schemas

### Key Configuration Files
- `react-router.config.ts` - React Router configuration with SSR enabled
- `vite.config.ts` - Vite build configuration with Cloudflare and TailwindCSS plugins
- `database/drizzle.config.ts` - Drizzle ORM configuration for Cloudflare D1

### Authentication
The project is set up to use Better Auth for authentication. The authentication setup appears to be in progress.

### Database
Uses Drizzle ORM with Cloudflare D1 (SQLite). Database schema is defined in `database/schema.ts`.

Required environment variables for database:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_DATABASE_ID`
- `CLOUDFLARE_D1_TOKEN`

### Requirements
A description of the project with loose requirements are captured in the `docs/` folder.

## Development Notes

- Uses Bun as the package manager and runtime
- Cloudflare types are auto-generated via `wrangler types` on postinstall
- React Router types are generated during typecheck
- The project uses modern React 19 and React Router 7 patterns
- TailwindCSS v4 is configured via Vite plugin
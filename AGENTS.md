## Project Overview

This is a full-stack React Router v7 application for Skybox Lofts, deployed on Cloudflare Workers. The project uses:

- **Bun** for development runtime & scripting
- **React Router v7** with server-side rendering
- **Cloudflare Workers** for serverless deployment
- **Drizzle ORM** with SQLite/D1 database
- **Better Auth** for authentication
- **TailwindCSS v4** for styling
- **shadcn/ui** for component library
- **TypeScript** throughout

## Development Commands

```bash
# Development server with HMR
bun run dev

# Type checking (generates Cloudflare types + React Router types + TypeScript check)
bun run typecheck

# Generate Cloudflare Workers types
bun run cf-typegen

# Database commands
bun run auth:generate          # Generate Better Auth schema
bun run db:generate            # Generate database migrations (includes auth schema)
bun run db:migrate:local       # Run migrations against local D1

# Add shadcn/ui components
bunx shadcn@latest add <component-name>
```

## Architecture

### File Structure
- `app/` - React Router application code
    - `routes/` - Page routes
    - `components/` - Reusable React components
        - `ui/` - shadcn/ui components (auto-generated)
    - `lib/` - Utility functions (e.g., `cn()` for className merging)
- `database/` - Database migrations and Drizzle configuration & schemas

### Key Configuration Files
- `react-router.config.ts` - React Router configuration with SSR enabled
- `vite.config.ts` - Vite build configuration with Cloudflare and TailwindCSS plugins
- `database/drizzle.config.ts` - Drizzle ORM configuration for Cloudflare D1
- `components.json` - shadcn/ui configuration

### UI Components & Styling
The project uses **shadcn/ui** for building the component library:
- Components are installed into `app/components/ui/` via the shadcn CLI
- Style: "new-york" variant
- Base color: "neutral"
- Icon library: Lucide React
- Path aliases configured:
    - `~/components` → components
    - `~/components/ui` → ui components
    - `~/lib` → utilities
    - `~/utils` → utilities
    - `~/hooks` → hooks

TailwindCSS v4 is configured via Vite plugin with CSS variables for theming.

### Authentication
The project uses Better Auth for authentication. Auth schema generation is integrated with database migrations via `bun run db:generate`.

### Database
Uses Drizzle ORM with Cloudflare D1 (SQLite). Database schema is defined in `database/schema.ts`.

Required environment variables for database:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_DATABASE_ID`
- `CLOUDFLARE_ACCOUNT_TOKEN`

### Requirements
Project requirements and specifications are documented in the `docs/` folder.

## Development Notes

- Uses Bun as the package manager and runtime
- Cloudflare types are auto-generated via `wrangler types` on postinstall
- React Router types are generated during typecheck
- The project uses modern React 19 and React Router 7 patterns
- TailwindCSS v4 is configured via Vite plugin (not a config file)
- When adding shadcn components, they will be installed with all necessary dependencies automatically
- ALWAYS use Tailwind theme variables (from app.css) instead of raw color utility classes e.g. text-muted-foreground over text-neutral-600
- Use the Playwright MCP server to view or verify your changes on localhost at port 5173
- Always check if the dev server is running first before trying to start it yourself
- All file names for React component should be in PascalCase
- Assume that users of this app aren't very technical. This should always be taken into account when writing any user-facing, written content.
- Prefer using react-router action functions over better-auth authClient methods
- Prefer fetching the user session in the data loader function instead of using authClient in the components
- Update @app/routes.ts whenever adding a new page to the app
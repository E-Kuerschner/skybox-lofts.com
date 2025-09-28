# Sky Box Lofts Website Requirements Document

## Overview
This document captures the content and functional requirements for the new Sky Box Lofts HOA website based on an exploration of the existing site at https://skyboxlofts.info and discussion with the board members.

The requirements are grouped into _phases_ to ensure the most crucial features are released first, followed up by improvements suggested by board members.

## Architecture

### Framework
The site shall be built using React Router v7 (formerly Remix). 
React Router docs: https://reactrouter.com/start/framework/installation.

### Infrastructure
Cloudflare services will be used for hosting static-assets/documents and databases.
All downloadable documents will be stored in a Cloudflare R2 bucket.
Any database tables will be created in a Cloudflare D1 database.
Service bindings are defined in `wrangler.jsonc`.
Drizzle will be used for the database ORM. Setup guide: https://orm.drizzle.team/docs/get-started/d1-new

### Auth
Better Auth will be used to set up sessions and authentication flows.
Better Auth docs: https://better-auth.com/llms.txt

### Content
The site will be composed of two main sections
1. public homepage accessible to anyone
2. a protected _resident only_ set of routes, protected by some form of authentication **(the style of authentication will depend on the phase of development we are in)**

### Environment Variables
Env vars should be written to .dev.vars. 
Anything added here, unless only used for local development, will need to be created in Cloudflare as well.
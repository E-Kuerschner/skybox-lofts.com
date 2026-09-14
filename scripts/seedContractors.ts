#!/usr/bin/env bun

/// <reference types="@types/bun" />

/**
 * Seeds the contractor directory - the service catalog, the building's service
 * providers, and the links between them - from database/seeds/contractor-directory.sql
 *
 * That .sql file is data rather than schema, so it is deliberately not a
 * migration and not checked in (see .gitignore). It guards every insert, so
 * running this more than once adds nothing the second time.
 *
 * Usage:
 *   bun run scripts/seedContractors.ts --local
 *   bun run scripts/seedContractors.ts --remote
 */

export {}; // Make this file a module to allow top-level await

// Parse command line arguments for --local or --remote flag
const args = process.argv.slice(2);
const isLocal = args.includes("--local");
const isRemote = args.includes("--remote");

if (!isLocal && !isRemote) {
  console.error("❌ Error: Please specify either --local or --remote flag");
  console.error(
    "   Usage: bun run scripts/seedContractors.ts [--local|--remote]",
  );
  process.exit(1);
}

if (isLocal && isRemote) {
  console.error("❌ Error: Cannot specify both --local and --remote flags");
  process.exit(1);
}

const DATABASE_NAME = "app";
const SEED_FILE = "database/seeds/contractor-directory.sql";
const envFlag = isLocal ? "--local" : "--remote";
const envName = isLocal ? "local" : "remote";

// The seed file isn't in version control, so a fresh clone won't have it. Say
// so plainly rather than letting wrangler fail with a bare path error.
if (!(await Bun.file(SEED_FILE).exists())) {
  console.error(`❌ Error: ${SEED_FILE} not found`);
  console.error(
    "   It holds data rather than schema, so it isn't checked in. Ask a",
  );
  console.error("   board member or teammate for a copy before seeding.");
  process.exit(1);
}

console.log(`🌱 Seeding the contractor directory into the ${envName} database...`);
console.log(`   Source: ${SEED_FILE}`);

try {
  const proc = Bun.spawn(
    [
      "wrangler",
      "d1",
      "execute",
      DATABASE_NAME,
      envFlag,
      "--yes",
      "--file",
      SEED_FILE,
    ],
    {
      stdout: "inherit",
      stderr: "inherit",
    },
  );

  const exitCode = await proc.exited;

  if (exitCode === 0) {
    console.log("✅ Contractor directory successfully seeded!");
  } else {
    console.error("❌ Failed to seed the contractor directory");
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Failed to seed the contractor directory:", error);
  process.exit(1);
}

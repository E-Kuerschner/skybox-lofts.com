#!/usr/bin/env bun

/// <reference types="@types/bun" />

/**
 * Seeds a default admin user into the D1 database
 * Requires ADMIN_EMAIL environment variable to be set
 *
 * Usage:
 *   ADMIN_EMAIL=admin@example.com bun run scripts/seedDefaultUser.ts --local
 *   ADMIN_EMAIL=admin@example.com bun run scripts/seedDefaultUser.ts --remote
 */

// Check for required environment variable
export {}; // Make this file a module to allow top-level await
const adminEmail = process.env.ADMIN_EMAIL;
if (!adminEmail) {
  console.error("❌ Error: ADMIN_EMAIL environment variable is required");
  process.exit(1);
}

// Parse command line arguments for --local or --remote flag
const args = process.argv.slice(2);
const isLocal = args.includes("--local");
const isRemote = args.includes("--remote");

if (!isLocal && !isRemote) {
  console.error("❌ Error: Please specify either --local or --remote flag");
  console.error("   Usage: ADMIN_EMAIL=admin@example.com bun run scripts/seedDefaultUser.ts [--local|--remote]");
  process.exit(1);
}

if (isLocal && isRemote) {
  console.error("❌ Error: Cannot specify both --local and --remote flags");
  process.exit(1);
}

// Database and user configuration
const DATABASE_NAME = "app";
const USER_NAME = "Root Admin";
const envFlag = isLocal ? "--local" : "--remote";
const envName = isLocal ? "local" : "remote";

console.log(`🔍 Checking if user already exists in ${envName} database...`);
console.log(`   Email: ${adminEmail}`);

try {
  // Check if user already exists
  const checkProc = Bun.spawn(
    [
      "wrangler",
      "d1",
      "execute",
      DATABASE_NAME,
      envFlag,
      "--command",
      `SELECT id FROM users WHERE email = '${adminEmail}';`,
    ],
    {
      stdout: "pipe",
      stderr: "pipe",
    },
  );

  const checkOutput = await new Response(checkProc.stdout).text();
  const checkExitCode = await checkProc.exited;

  if (checkExitCode !== 0) {
    console.error(`❌ Failed to check for existing user in ${envName} database`);
    process.exit(1);
  }

  // If the output contains a user ID, the user already exists
  if (checkOutput.includes('"id"')) {
    console.log("ℹ️  User already exists. Skipping seed.");
    process.exit(0);
  }

  console.log(`🌱 Seeding admin user into ${envName} D1 database...`);
  console.log(`   Name: ${USER_NAME}`);

  // Generate a unique ID for the user (similar to what Better Auth would generate)
  const userId = crypto.randomUUID();

  // Create the SQL INSERT statement
  const sql = `INSERT INTO users (id, name, email, email_verified, created_at, updated_at, role, is_anonymous) VALUES ('${userId}', '${USER_NAME}', '${adminEmail}', 1, ${Date.now()}, ${Date.now()}, 'admin', 0);`;

  // Execute the SQL command against the D1 database using Bun's shell
  const insertProc = Bun.spawn(
    ["wrangler", "d1", "execute", DATABASE_NAME, envFlag, "--command", sql],
    {
      stdout: "inherit",
      stderr: "inherit",
    },
  );

  const insertExitCode = await insertProc.exited;

  if (insertExitCode === 0) {
    console.log("✅ Admin user successfully seeded!");
  } else {
    console.error("❌ Failed to seed admin user");
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Failed to seed admin user:", error);
  process.exit(1);
}

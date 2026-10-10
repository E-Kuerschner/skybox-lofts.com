#!/bin/sh
# SessionStart hook: the first time Claude Code starts in a new worktree, set
# up a local database with an admin user to sign in as.
#
# Requires ADMIN_EMAIL in .dev.vars: the email address of the admin user that
# `bun run db:reset:local` seeds. Put it in the main checkout's .dev.vars;
# .worktreeinclude copies that file into every new worktree.
#
# Never fails the session: if something's missing it says so and carries on.
# Anything printed to stdout is shown to Claude at the start of the session.

cd "$CLAUDE_PROJECT_DIR" || exit 0

# Only in worktrees. The main checkout's database is yours to manage.
git_dir=$(git rev-parse --path-format=absolute --git-dir 2>/dev/null)
common_dir=$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null)
[ -n "$git_dir" ] && [ "$git_dir" != "$common_dir" ] || exit 0

# Already set up
[ -d .wrangler/state/v3/d1 ] && exit 0

if ! grep -q '^ADMIN_EMAIL=.' .dev.vars 2>/dev/null; then
  echo "Skipped setting up the local database in this worktree: ADMIN_EMAIL isn't set in .dev.vars. It's the email address of the admin user the database is seeded with, used to sign in locally. Add ADMIN_EMAIL=<email> to .dev.vars here and in the main checkout's .dev.vars (so new worktrees get it), then run: bun run db:reset:local"
  exit 0
fi

# Wrangler needs Node 24 (see .claude/launch.json)
node24=$(ls -d "$HOME"/.nvm/versions/node/v24.* 2>/dev/null | tail -1)
[ -n "$node24" ] && PATH="$node24/bin:$PATH"

log=.wrangler/worktree-setup.log
mkdir -p .wrangler

{
  [ -d node_modules ] || bun install
  bun run db:reset:local
} >"$log" 2>&1

if [ $? -eq 0 ]; then
  echo "Set up the local database in this worktree and seeded the admin user from ADMIN_EMAIL in .dev.vars."
else
  echo "Setting up the local database in this worktree failed. See $log, then run: bun run db:reset:local"
fi
exit 0

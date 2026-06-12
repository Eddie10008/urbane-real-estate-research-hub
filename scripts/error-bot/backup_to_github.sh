#!/usr/bin/env bash
# Create a timestamped backup commit and push to GitHub before any fixes.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

STAMP="$(date -u +"%Y-%m-%dT%H-%M-%SZ")"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
LOG_FILE=".cursor/error-bot/backup.log"

mkdir -p .cursor/error-bot

if ! git remote get-url origin &>/dev/null; then
  echo "ERROR: No git remote 'origin' configured." >&2
  exit 1
fi

git add -A
if git diff --cached --quiet; then
  echo "No local changes to commit; pushing existing branch as safety snapshot."
  git push origin "$BRANCH" 2>&1 | tee -a "$LOG_FILE"
  echo "BACKUP_OK: pushed $BRANCH @ $(git rev-parse --short HEAD)"
  exit 0
fi

git commit -m "$(cat <<EOF
chore(error-bot): pre-fix backup $STAMP

Automated safety snapshot before error-bot applies fixes.
EOF
)"

git push origin "$BRANCH" 2>&1 | tee -a "$LOG_FILE"
echo "BACKUP_OK: committed and pushed $BRANCH @ $(git rev-parse --short HEAD)"

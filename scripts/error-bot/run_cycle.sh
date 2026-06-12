#!/usr/bin/env bash
# One error-bot cycle: check → (if bugs) backup → notify → stop before fixing.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
BOT_DIR="$ROOT/.cursor/error-bot"
LOG="$BOT_DIR/runs.log"
CHECK="$ROOT/scripts/error-bot/check_errors.py"
mkdir -p "$BOT_DIR"

STAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "[$STAMP] cycle start" >> "$LOG"

set +e
python3 "$CHECK" > "$BOT_DIR/latest-report.json"
CHECK_EXIT=$?
set -e

if [[ "$CHECK_EXIT" -eq 0 ]]; then
  echo "[$STAMP] OK — no errors" >> "$LOG"
  echo '{"action":"none","message":"No errors found"}'
  python3 - <<'PY'
import json
from datetime import datetime, timezone
from pathlib import Path
state = Path(".cursor/error-bot/state.json")
if state.exists():
    data = json.loads(state.read_text())
    if data.get("status") == "awaiting_approval":
        pass
    else:
        state.write_text(json.dumps({"status": "idle", "last_clean_at": datetime.now(timezone.utc).isoformat()}, indent=2))
else:
    state.write_text(json.dumps({"status": "idle", "last_clean_at": datetime.now(timezone.utc).isoformat()}, indent=2))
PY
  exit 0
fi

echo "[$STAMP] BUGS FOUND — backing up" >> "$LOG"
bash "$ROOT/scripts/error-bot/backup_to_github.sh" >> "$LOG" 2>&1
bash "$ROOT/scripts/error-bot/notify_user.sh" | tee -a "$LOG"

echo '{"action":"notify","message":"Bugs found. User notified. Awaiting approval before fixes.","report":".cursor/error-bot/pending-bugs.md"}'
exit 2

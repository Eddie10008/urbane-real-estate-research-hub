#!/usr/bin/env bash
# User approves automatic fixes after reviewing the bug report.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STATE="$ROOT/.cursor/error-bot/state.json"
mkdir -p "$ROOT/.cursor/error-bot"

python3 - "$STATE" <<'PY'
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

state_path = Path(sys.argv[1])
state = {}
if state_path.exists():
    state = json.loads(state_path.read_text())

state.update({
    "status": "approved_to_fix",
    "approved_at": datetime.now(timezone.utc).isoformat(),
})
state_path.write_text(json.dumps(state, indent=2), encoding="utf-8")
print("Approved. The error bot may now apply fixes on the next agent cycle.")
PY

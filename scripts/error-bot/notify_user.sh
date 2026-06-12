#!/usr/bin/env bash
# macOS notification + human-readable bug summary for user review before fixes.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
REPORT="$ROOT/.cursor/error-bot/latest-report.json"
MD_REPORT="$ROOT/.cursor/error-bot/pending-bugs.md"
STATE="$ROOT/.cursor/error-bot/state.json"

mkdir -p "$ROOT/.cursor/error-bot"

if [[ ! -f "$REPORT" ]]; then
  echo "ERROR: No report at $REPORT" >&2
  exit 1
fi

eval "$(python3 - "$REPORT" "$MD_REPORT" "$STATE" <<'PY'
import json
import shlex
import sys
from datetime import datetime, timezone
from pathlib import Path

report_path, md_path, state_path = map(Path, sys.argv[1:4])
report = json.loads(report_path.read_text())
bugs = report.get("bugs", [])
errors = [b for b in bugs if b.get("severity") == "error"]
warnings = [b for b in bugs if b.get("severity") == "warning"]

lines = [
    "# Error Bot — Bug Report (awaiting your review)",
    "",
    f"**Checked:** {report.get('checked_at', 'unknown')}",
    f"**Errors:** {len(errors)} · **Warnings:** {len(warnings)}",
    "",
    "> The project was backed up to GitHub before any fixes are attempted.",
    "> Reply **fix them** in Cursor chat, or run: `./scripts/error-bot/approve-fix.sh`",
    "",
]

if errors:
    lines.extend(["## Errors", ""])
    for i, b in enumerate(errors, 1):
        loc = b["file"]
        if b.get("line"):
            loc += f":{b['line']}"
        lines.append(f"{i}. **[{b['category']}]** `{loc}` — {b['message']}")
    lines.append("")

if warnings:
    lines.extend(["## Warnings", ""])
    for i, b in enumerate(warnings, 1):
        loc = b["file"]
        if b.get("line"):
            loc += f":{b['line']}"
        lines.append(f"{i}. **[{b['category']}]** `{loc}` — {b['message']}")
    lines.append("")

md_path.write_text("\n".join(lines), encoding="utf-8")

state = {
    "status": "awaiting_approval",
    "notified_at": datetime.now(timezone.utc).isoformat(),
    "error_count": len(errors),
    "warning_count": len(warnings),
    "bug_count": len(bugs),
}
state_path.write_text(json.dumps(state, indent=2), encoding="utf-8")

title = "Urbane Error Bot"
subtitle = f"{len(errors)} error(s), {len(warnings)} warning(s) found"
body = "Backed up to GitHub. Review pending-bugs.md before fixes."
print(f"TITLE={shlex.quote(title)}")
print(f"SUBTITLE={shlex.quote(subtitle)}")
print(f"BODY={shlex.quote(body)}")
print(f"ERRORS={len(errors)}")
print(f"WARNINGS={len(warnings)}")
PY
)"

if command -v osascript &>/dev/null; then
  osascript -e "display notification \"$BODY\" with title \"$TITLE\" subtitle \"$SUBTITLE\" sound name \"Glass\""
fi

echo "NOTIFIED: $ERRORS error(s), $WARNINGS warning(s)"
echo "Report: $MD_REPORT"

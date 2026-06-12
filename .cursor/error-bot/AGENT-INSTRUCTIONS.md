# Urbane Error Bot — Agent Instructions

This project has an automated error bot that runs every **108 seconds**.

## On each cycle (`./scripts/error-bot/run_cycle.sh`)

1. **Check** — `scripts/error-bot/check_errors.py` scans HTML, CSS, JS, links, and assets.
2. **If clean** — log and exit. No action needed.
3. **If bugs found**:
   - **Backup** — `scripts/error-bot/backup_to_github.sh` commits and pushes to GitHub first.
   - **Collect** — full bug list written to `.cursor/error-bot/pending-bugs.md` and `latest-report.json`.
   - **Notify** — macOS notification + you must summarize all bugs in chat for the user.
   - **Stop** — do **not** fix until the user approves.

## User approval

The user can approve fixes by:

- Replying **"fix them"** in chat, or
- Running `./scripts/error-bot/approve-fix.sh`

Only after approval (`state.json` → `approved_to_fix`):

1. Fix every bug listed in `pending-bugs.md`.
2. Re-run `./scripts/error-bot/run_cycle.sh` to verify.
3. Reset state to `idle` when clean.

## Important rules

- Never skip the GitHub backup when errors are found.
- Always show the complete bug list to the user before editing files.
- Prefer minimal, targeted fixes matching project conventions.

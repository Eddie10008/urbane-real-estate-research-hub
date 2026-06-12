#!/usr/bin/env bash
# Start the 108-second error-bot monitoring loop.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PID_FILE="$ROOT/.cursor/error-bot/loop.pid"
INTERVAL=108

mkdir -p "$ROOT/.cursor/error-bot"

if [[ -f "$PID_FILE" ]]; then
  OLD_PID="$(cat "$PID_FILE")"
  if kill -0 "$OLD_PID" 2>/dev/null; then
    echo "Error bot already running (PID $OLD_PID). Stop it first: ./scripts/error-bot/stop.sh"
    exit 1
  fi
fi

nohup bash -c "
  while true; do
    sleep $INTERVAL
    echo 'AGENT_LOOP_TICK_ERROR_BOT {\"prompt\":\"Run the Urbane Error Bot cycle: execute ./scripts/error-bot/run_cycle.sh. If exit code 2 (bugs found), read .cursor/error-bot/pending-bugs.md and present ALL bugs to the user in chat. Do NOT fix anything until the user approves. If state is approved_to_fix, fix all listed bugs then run check again and reset state to idle.\"}'
  done
" > "$ROOT/.cursor/error-bot/loop.out" 2>&1 &

echo $! > "$PID_FILE"
echo "Error bot started (PID $(cat "$PID_FILE")). Checks every ${INTERVAL}s."
echo "First automated tick in ${INTERVAL}s. Running initial check now..."

bash "$ROOT/scripts/error-bot/run_cycle.sh"

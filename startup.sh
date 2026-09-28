#!/bin/sh
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if [ -d /workspace ]; then
  cd /workspace
else
  cd "$SCRIPT_DIR"
fi
# :8081 is QA-only — a revive must never inherit a stale built-output preview.
node scripts/preview.mjs stop || true
if node -e 'fetch("http://127.0.0.1:8080/").then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))'; then
  exit 0
fi
npm run dev >>/tmp/app-startup.log 2>&1 &

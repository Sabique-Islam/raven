#!/usr/bin/env bash
# query-index.sh — Search the local openjobdata SQLite index.
#
# Requires data/jobs.db (run raven sync-jobs first).
#
# Usage:
#   raven query --q "software engineer" --since 7
#   raven query --q "ML engineer" --ats greenhouse,lever --json

set -euo pipefail
source "$(dirname "$0")/_lib.sh"

show_help() {
  raven_print_block "query-index.sh — search local job index" \
    "Requires: raven sync-jobs" \
    "" \
    "Examples:" \
    "  raven query --q \"software engineer\" --since 7" \
    "  raven query --q \"data engineer\" --json"
}

if raven_wants_help "$@"; then
  show_help
  exit 0
fi

raven_load_env
raven_require_setup

if [[ ! -f "${RAVEN_ROOT}/data/jobs.db" ]]; then
  echo "Local index not found at data/jobs.db" >&2
  echo "" >&2
  echo "Run first:" >&2
  echo "  raven sync-jobs" >&2
  exit 1
fi

raven_run_jobs query-index.mjs "$@"

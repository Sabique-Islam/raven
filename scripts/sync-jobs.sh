#!/usr/bin/env bash
# sync-jobs.sh — Download openjobdata daily deltas into data/jobs.db.
#
# Populates the local index for discover.sh --sources index.
# Exports ATS company lists to data/cache/ats-companies/.
#
# Usage:
#   raven sync-jobs
#   raven sync-jobs --days 3
#
# Environment (.env):
#   HF_TOKEN   HuggingFace read token (if bucket returns 401)
#
# Cron (daily at 6am):
#   0 6 * * * cd /path/to/raven && raven sync-jobs

set -euo pipefail
source "$(dirname "$0")/_lib.sh"

show_help() {
  raven_print_block "sync-jobs.sh — openjobdata index sync" \
    "Examples:" \
    "  raven sync-jobs" \
    "  raven sync-jobs --days 3" \
    "" \
    "If HTTP 401, add to .env:" \
    "  HF_TOKEN=hf_xxxxxxxx" \
    "" \
    "Then search:" \
    "  raven discover --sources index --q \"engineer\" --json"
}

if raven_wants_help "$@"; then
  show_help
  exit 0
fi

raven_load_env
raven_require_setup
raven_run_jobs sync-openjobdata.mjs "$@"

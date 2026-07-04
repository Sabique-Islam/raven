#!/usr/bin/env bash
# discover.sh — Unified job discovery (main entry point).
#
# Searches live ATS APIs, board feeds, and local openjobdata index in parallel.
#
# Usage:
#   raven discover --q "software engineer" --loc Remote --since 7
#   raven discover --q "backend" --json
#   raven discover --stream --q "ML engineer"
#   raven discover --sources ats,boards --ats greenhouse,lever
#
# Flags:
#   --q, --not          Title keywords include / exclude
#   --loc, --noloc      Location allow / block (comma-separated)
#   --home              Location always-allow
#   --since N           Last N days (default: 7)
#   --sources           ats,boards,index,hiringcafe (default: ats,boards,index)
#   --ats               ATS platforms (default: all 12)
#   --limit N           Max companies per ATS
#   --max N             Max total results
#   --json              JSON output
#   --save PATH         Save discover results JSON (for raven draft)
#   --stream            NDJSON stream (for a future web UI)
#   --verbose           Per-tier detail + child process logs
#   --quiet             Summary only
#   --log               Force log file (default in interactive mode)
#   --no-log            Disable data/logs/*.log
#   --help              Show help

set -euo pipefail
source "$(dirname "$0")/_lib.sh"

show_help() {
  raven_print_block "discover.sh — unified job search" \
    "Examples:" \
    "  raven discover --q \"software engineer\" --loc Remote --since 7" \
    "  raven discover --q \"backend\" --json" \
    "  raven discover --stream --q \"data engineer\"" \
    "  raven discover --sources ats,boards --ats greenhouse,lever,ashby" \
    "" \
    "Sources (--sources):" \
    "  ats         Greenhouse, Lever, Ashby, Workday, …" \
    "  boards      RemoteOK, Remotive, Arbeitnow, Landing.jobs" \
    "  index       Local SQLite (run raven sync-jobs first)" \
    "  hiringcafe  Set HIRING_CAFE_ENABLED=1 in .env" \
    "" \
    "Logging:" \
    "  Progress + stats printed live; log saved to data/logs/ (disable with --no-log)" \
    "  --verbose  extra detail   --quiet  summary only" \
    "" \
    "Before first run: raven setup"
}

if raven_wants_help "$@"; then
  show_help
  exit 0
fi

raven_load_env
raven_require_setup
raven_run_jobs discover.mjs "$@"

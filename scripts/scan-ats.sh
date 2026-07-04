#!/usr/bin/env bash
# scan-ats.sh — Live ATS reverse scan (Greenhouse, Lever, Ashby, Workday, …).
#
# Usage:
#   raven scan-ats --q "software engineer" --since 7
#   raven scan-ats --q engineer --ats greenhouse,lever --json
#   raven scan-ats --use-portals --dry-run
#
# Flags: --q --not --loc --noloc --home --since --ats --limit --dry-run --json --verbose --use-portals

set -euo pipefail
source "$(dirname "$0")/_lib.sh"

show_help() {
  raven_print_block "scan-ats.sh — live ATS scan" \
    "Examples:" \
    "  raven scan-ats --q \"software engineer\" --since 7 --dry-run" \
    "  raven scan-ats --q engineer --ats greenhouse,lever,ashby --json" \
    "  raven scan-ats --use-portals --dry-run" \
    "" \
    "ATS: greenhouse, lever, ashby, workday, rippling, workable, bamboohr," \
    "     smartrecruiters, recruitee, pinpoint, teamtailor, personio"
}

if raven_wants_help "$@"; then
  show_help
  exit 0
fi

raven_load_env
raven_require_setup
# Uses Node helper for temp portals.yml generation from CLI flags
raven_run_node "${RAVEN_ROOT}/scripts/scan-ats.js" "$@"

#!/usr/bin/env bash
# scan-boards.sh — Board feed scan (RemoteOK, Remotive, Arbeitnow, Landing.jobs).
#
# Usage:
#   raven scan-boards --q "software engineer"
#   raven scan-boards --q engineer --loc Remote --json
#   raven scan-boards --use-portals --save

set -euo pipefail
source "$(dirname "$0")/_lib.sh"

show_help() {
  raven_print_block "scan-boards.sh — board feed scan" \
    "Examples:" \
    "  raven scan-boards --q \"software engineer\"" \
    "  raven scan-boards --q engineer --loc Remote --json" \
    "  raven scan-boards --use-portals --save" \
    "" \
    "Boards: RemoteOK, Remotive, Arbeitnow, Landing.jobs"
}

if raven_wants_help "$@"; then
  show_help
  exit 0
fi

raven_load_env
raven_require_setup
raven_run_node "${RAVEN_ROOT}/scripts/scan-boards.js" "$@"

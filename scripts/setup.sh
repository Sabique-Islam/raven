#!/usr/bin/env bash
# setup.sh — First-time Raven setup (also: raven setup)
#
# Usage:
#   raven setup

set -euo pipefail
source "$(dirname "$0")/_lib.sh"

echo "Raven setup"
echo ""

raven_ensure_installed
raven_ensure_config

raven_print_block "Setup complete" \
  "Next steps:" \
  "" \
  "  1. Edit .env                         OAuth + optional HF_TOKEN" \
  "  2. Edit config/portals.yml           Job title/location filters" \
  "  3. raven discover --q \"software engineer\" --since 7" \
  "  4. raven sync-jobs                   Optional: openjobdata index" \
  "  5. raven auth-gmail                 One-time Gmail OAuth" \
  "" \
  "Optional: npm link   # install \`raven\` globally on your PATH" \
  "" \
  "Run: raven --help"

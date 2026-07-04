#!/usr/bin/env bash
# auth-gmail.sh — One-time Gmail OAuth setup.
#
# Saves GMAIL_REFRESH_TOKEN to .env.
# Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first.
#
# Usage:
#   raven auth-gmail

set -euo pipefail
source "$(dirname "$0")/_lib.sh"

raven_print_block "Gmail OAuth" \
  "Ensure .env has GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET." \
  "Token will be saved to .env after browser auth." \
  ""

raven_load_env
raven_require_node
(cd "${RAVEN_ROOT}" && node setup-gmail-auth.js)

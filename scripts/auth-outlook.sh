#!/usr/bin/env bash
# auth-outlook.sh — One-time Outlook / Microsoft OAuth setup.
#
# Saves refresh token to .env.
# Requires AZURE_CLIENT_ID and AZURE_CLIENT_SECRET in .env first.
#
# Usage:
#   raven auth-outlook

set -euo pipefail
source "$(dirname "$0")/_lib.sh"

raven_print_block "Outlook OAuth" \
  "Ensure .env has AZURE_CLIENT_ID and AZURE_CLIENT_SECRET." \
  "Token will be saved to .env after browser auth." \
  ""

raven_load_env
raven_require_node
(cd "${RAVEN_ROOT}" && node setup-outlook-auth.js)

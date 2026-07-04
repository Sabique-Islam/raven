#!/usr/bin/env bash
# send.sh — Send outreach emails from a CSV or XLSX file.
#
# Columns: contact_email (or email), subject, body
# Attachments: place files in files/ at repo root
#
# Usage:
#   raven send --input drafts/contacts.csv --dry-run
#   raven send --input contacts.xlsx --provider gmail --delay 60
#   raven send --input contacts.csv --provider outlook --limit 20
#
# Setup: raven setup && raven auth-gmail

set -euo pipefail
source "$(dirname "$0")/_lib.sh"

show_help() {
  raven_print_block "send.sh — bulk email outreach" \
    "CSV columns: contact_email, subject, body" \
    "" \
    "Examples:" \
    "  raven send --input drafts/contacts.csv --dry-run" \
    "  raven send --input contacts.csv --delay 60" \
    "  raven send --provider outlook --limit 20" \
    "" \
    "Requires .env: SENDER_NAME, SENDER_EMAIL, OAuth from auth-gmail.sh"
}

if raven_wants_help "$@"; then
  show_help
  exit 0
fi

raven_load_env
raven_require_setup
raven_run_node "${RAVEN_ROOT}/scripts/send-prewritten.js" "$@"

#!/usr/bin/env bash
# Shared helpers for Raven bash scripts. Source this file; do not run directly.
#   source "$(dirname "${BASH_SOURCE[0]}")/_lib.sh"

set -euo pipefail

# Repo root (parent of scripts/)
RAVEN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export RAVEN_ROOT

raven_load_env() {
  if [[ -f "${RAVEN_ROOT}/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "${RAVEN_ROOT}/.env" 2>/dev/null || true
    set +a
  fi
}

raven_require_node() {
  if ! command -v node >/dev/null 2>&1; then
    echo "Error: node is not installed. Install Node.js 18+ and retry." >&2
    exit 1
  fi
}

raven_root_installed() {
  [[ -d "${RAVEN_ROOT}/node_modules" ]]
}

raven_jobs_installed() {
  [[ -d "${RAVEN_ROOT}/jobs/node_modules" ]]
}

raven_ensure_installed() {
  raven_require_node
  if ! raven_root_installed; then
    echo "Installing root dependencies…"
    (cd "${RAVEN_ROOT}" && npm install)
  fi
  if ! raven_jobs_installed; then
    echo "Installing jobs/ dependencies…"
    (cd "${RAVEN_ROOT}/jobs" && npm install)
  fi
}

raven_ensure_config() {
  mkdir -p "${RAVEN_ROOT}/data/cache" "${RAVEN_ROOT}/drafts"
  if [[ ! -f "${RAVEN_ROOT}/.env" && -f "${RAVEN_ROOT}/.env.example" ]]; then
    cp "${RAVEN_ROOT}/.env.example" "${RAVEN_ROOT}/.env"
    echo "Created .env from .env.example — fill in your credentials."
  fi
  if [[ ! -f "${RAVEN_ROOT}/config/portals.yml" && -f "${RAVEN_ROOT}/config/portals.example.yml" ]]; then
    cp "${RAVEN_ROOT}/config/portals.example.yml" "${RAVEN_ROOT}/config/portals.yml"
    echo "Created config/portals.yml from example — edit your search filters."
  fi
}

raven_require_setup() {
  raven_require_node
  if ! raven_root_installed || ! raven_jobs_installed; then
    echo "Dependencies not installed. Run:" >&2
    echo "" >&2
    echo "  raven setup" >&2
    echo "" >&2
    exit 1
  fi
}

raven_wants_help() {
  for arg in "$@"; do
    case "$arg" in
      -h|--help|help) return 0 ;;
    esac
  done
  return 1
}

raven_print_block() {
  local title="$1"
  shift
  echo ""
  echo "${title}"
  printf '%*s\n' "${#title}" '' | tr ' ' '─'
  for line in "$@"; do
    echo "${line}"
  done
  echo ""
}

raven_run_jobs() {
  local script="$1"
  shift
  (cd "${RAVEN_ROOT}" && node "${RAVEN_ROOT}/jobs/${script}" "$@")
}

raven_run_node() {
  local script="$1"
  shift
  (cd "${RAVEN_ROOT}" && node "${script}" "$@")
}

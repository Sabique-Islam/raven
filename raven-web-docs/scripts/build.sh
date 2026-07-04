#!/usr/bin/env bash
# Build Raven docs for production (local, CI, Vercel).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

HUGO_VERSION="0.145.0"

install_hugo() {
  if command -v hugo >/dev/null 2>&1; then
    return 0
  fi

  local os arch
  os="$(uname -s | tr '[:upper:]' '[:lower:]')"
  case "$(uname -m)" in
    x86_64|amd64) arch="amd64" ;;
    arm64|aarch64) arch="arm64" ;;
    *) echo "Unsupported architecture: $(uname -m)" >&2; exit 1 ;;
  esac

  local platform="${os}-${arch}"
  local tarball="hugo_extended_${HUGO_VERSION}_${platform}.tar.gz"
  local url="https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/${tarball}"

  echo "Installing Hugo Extended ${HUGO_VERSION} (${platform})…"
  curl -fsSL "$url" -o /tmp/hugo.tar.gz
  tar -xzf /tmp/hugo.tar.gz -C /tmp hugo
  export PATH="/tmp:${PATH}"
  hugo version
}

resolve_base_url() {
  if [[ -n "${HUGO_BASEURL:-}" ]]; then
    echo "$HUGO_BASEURL"
  elif [[ -n "${VERCEL_PROJECT_PRODUCTION_URL:-}" ]]; then
    echo "https://${VERCEL_PROJECT_PRODUCTION_URL}/"
  elif [[ -n "${VERCEL_URL:-}" ]]; then
    echo "https://${VERCEL_URL}/"
  else
    grep '^baseURL' hugo.toml | sed -E "s/.*'([^']+)'.*/\1/" | sed 's|$|/|'
  fi
}

install_hugo
bash "$ROOT/scripts/setup-theme.sh"

BASE_URL="$(resolve_base_url)"
echo "Building with baseURL=${BASE_URL}"

hugo --minify --baseURL "$BASE_URL"
echo "Done → public/"

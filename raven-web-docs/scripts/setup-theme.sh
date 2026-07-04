#!/usr/bin/env bash
# Install Hugo Book theme (v11 — compatible with Hugo Extended 0.145+)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
THEME="$ROOT/themes/hugo-book"
TAG="v11.0.0"

if [[ -d "$THEME/.git" ]] || [[ -f "$THEME/theme.toml" ]]; then
  echo "Theme already present at themes/hugo-book"
  exit 0
fi

mkdir -p "$ROOT/themes"
git clone --depth 1 --branch "$TAG" https://github.com/alex-shpak/hugo-book.git "$THEME"
echo "Installed hugo-book $TAG"

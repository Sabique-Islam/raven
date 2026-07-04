#!/usr/bin/env bash
# Deprecated: use \`raven\` instead. Forwards to bin/raven.
exec "$(cd "$(dirname "$0")/.." && pwd)/bin/raven" "$@"

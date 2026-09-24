#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
if command -v podman >/dev/null 2>&1; then
  engine=podman
else
  engine=docker
fi
# Match the CI OS, architecture, browser and fonts. Source media is never rewritten.
exec "$engine" run --rm --platform linux/arm64 --ipc=host \
  -e VISUAL_CONTROLS \
  -v "$PWD:/work" -w /work \
  mcr.microsoft.com/playwright:v1.62.1-noble \
  npx --no-install playwright test "$@"

#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARTIFACTS_DIR="$ROOT_DIR/web-ext-artifacts"
STAGE_DIR="$ARTIFACTS_DIR/firefox-package"

cd "$ROOT_DIR"

if ! command -v zip >/dev/null 2>&1; then
  echo "zip is required to create the Firefox release archive." >&2
  exit 1
fi

VERSION="$(node -e "process.stdout.write(JSON.parse(require('node:fs').readFileSync('manifest.json', 'utf8')).version)")"
ZIP_NAME="fancy-hn-firefox-v${VERSION}.zip"
ZIP_PATH="$ARTIFACTS_DIR/$ZIP_NAME"

echo "Building Firefox extension..."
pnpm build:firefox

rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR/src/content"

cp manifest.json "$STAGE_DIR/manifest.json"
cp -R icons "$STAGE_DIR/icons"
cp -R dist "$STAGE_DIR/dist"
cp src/content/anti-fouc.js "$STAGE_DIR/src/content/anti-fouc.js"

find "$STAGE_DIR/dist" -type f -name '*.map' -delete

rm -f "$ZIP_PATH"
(
  cd "$STAGE_DIR"
  zip -qr "$ZIP_PATH" .
)

echo "Created $ZIP_PATH"

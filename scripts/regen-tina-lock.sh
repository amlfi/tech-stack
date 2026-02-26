#!/bin/bash
# Regenerate tina-lock.json via a symlink that avoids the Dropbox parentheses path issue.
# Usage: bash scripts/regen-tina-lock.sh

set -e

REAL_PATH="$(cd "$(dirname "$0")/.." && pwd)"
SYMLINK="/tmp/txstack-tina"

echo "Creating symlink: $SYMLINK -> $REAL_PATH"
ln -sfn "$REAL_PATH" "$SYMLINK"

cd "$SYMLINK"

echo ""
echo "Starting tinacms dev to regenerate tina-lock.json..."
echo "Wait until you see 'Listening on ...' then press Ctrl+C."
echo ""

npx tinacms dev

# Cleanup
rm -f "$SYMLINK"
echo ""
echo "tina-lock.json regenerated. Symlink cleaned up."

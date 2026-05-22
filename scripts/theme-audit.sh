#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Running theme audit..."
echo

TARGETS=(
  "app"
  "components"
)

IGNORE_GLOBS=(
  "--glob=!**/*.md"
  "--glob=!**/*.json"
  "--glob=!**/*.svg"
  "--glob=!**/*.map"
  "--glob=!components/auth/LoginForm.tsx"
  "--glob=!components/auth/RegisterForm.tsx"
)

PATTERN='text-blue-|bg-blue-|border-blue-|text-gray-|bg-gray-|border-gray-|#[0-9a-fA-F]{3,8}'

echo "Scanning for legacy color utilities and hardcoded hex colors:"
echo "Pattern: $PATTERN"
echo

if rg -n -S -g "*.tsx" -g "*.ts" -g "*.css" "${IGNORE_GLOBS[@]}" "$PATTERN" "${TARGETS[@]}"; then
  echo
  echo "Theme audit found candidates. Review these lines before merging."
  exit 1
else
  echo "Theme audit passed: no legacy patterns found."
fi

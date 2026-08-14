#!/usr/bin/env bash
set -euo pipefail

# Mobile/Codespaces bootstrap for the verified Pawan Satoshi Academy handoff.
# Upload the handoff ZIP into the repository root, then run:
#   bash scripts/import-handoff.sh ./pawan-satoshi-academy-HANDOFF-snapshot.zip

ZIP_PATH="${1:-./pawan-satoshi-academy-HANDOFF-snapshot.zip}"
ROOT="$(git rev-parse --show-toplevel)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if [[ ! -f "$ZIP_PATH" ]]; then
  echo "ERROR: Handoff ZIP not found: $ZIP_PATH" >&2
  exit 1
fi

command -v unzip >/dev/null || { echo "ERROR: unzip is required." >&2; exit 1; }

unzip -q -o "$ZIP_PATH" -d "$TMP"
SOURCE="$TMP/pawan-satoshi-academy"
[[ -d "$SOURCE" ]] || { echo "ERROR: Unexpected ZIP structure." >&2; exit 1; }

# Never import secrets or local runtime state from a handoff archive.
find "$SOURCE" -type f \( -name '.env' -o -name '*.db' -o -name '*.sqlite' -o -name '*.sqlite3' \) -print -delete

# Copy the complete handoff into the repository while preserving the current Git metadata.
cp -a "$SOURCE"/. "$ROOT"/

# Ensure the bot can never accidentally commit a local secret/database.
cat >> "$ROOT/.gitignore" <<'EOF'

# Local runtime secrets/state
.env
.env.*
!.env.example
*.db
*.sqlite
*.sqlite3
node_modules/
data/
EOF

printf '\nHandoff imported successfully.\n'
printf 'Next: inspect git diff, then run the documented tests before committing.\n'

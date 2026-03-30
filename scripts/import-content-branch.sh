#!/usr/bin/env bash

set -euo pipefail

repo_root=$(git rev-parse --show-toplevel)
script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
paths_file="$script_dir/content-paths.txt"
content_branch="${1:-content}"

cd "$repo_root"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or stash changes first." >&2
  exit 1
fi

if [[ ! -f "$paths_file" ]]; then
  echo "Missing content paths file: $paths_file" >&2
  exit 1
fi

if ! git rev-parse --verify "$content_branch" >/dev/null 2>&1; then
  echo "Branch '$content_branch' does not exist." >&2
  exit 1
fi

content_paths=()

while IFS= read -r path; do
  [[ -z "$path" || "$path" =~ ^[[:space:]]*# ]] && continue
  content_paths+=("$path")
done < "$paths_file"

if [[ ${#content_paths[@]} -eq 0 ]]; then
  echo "No content paths configured." >&2
  exit 1
fi

git restore --source "$content_branch" --worktree -- "${content_paths[@]}"

echo "Restored content paths from '$content_branch' into the working tree."

#!/usr/bin/env bash

set -euo pipefail

repo_root=$(git rev-parse --show-toplevel)
script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
paths_file="$script_dir/content-paths.txt"
content_branch="${1:-content}"
source_ref="${2:-HEAD}"

cd "$repo_root"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or stash changes first." >&2
  exit 1
fi

if [[ ! -f "$paths_file" ]]; then
  echo "Missing content paths file: $paths_file" >&2
  exit 1
fi

mapfile -t content_paths < <(grep -Ev '^[[:space:]]*(#|$)' "$paths_file")

if [[ ${#content_paths[@]} -eq 0 ]]; then
  echo "No content paths configured." >&2
  exit 1
fi

mapfile -t content_files < <(git ls-tree -r --name-only "$source_ref" -- "${content_paths[@]}")

tmp_dir=$(mktemp -d "${TMPDIR:-/tmp}/content-branch.XXXXXX")

cleanup() {
  git worktree remove --force "$tmp_dir" >/dev/null 2>&1 || true
  rm -rf "$tmp_dir"
}

trap cleanup EXIT

if git show-ref --verify --quiet "refs/heads/$content_branch"; then
  git worktree add "$tmp_dir" "$content_branch" >/dev/null
else
  git worktree add -b "$content_branch" "$tmp_dir" "$source_ref" >/dev/null
fi

find "$tmp_dir" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +

if [[ ${#content_files[@]} -gt 0 ]]; then
  git archive "$source_ref" "${content_files[@]}" | tar -x -C "$tmp_dir"
fi

git show "$source_ref:.gitignore" > "$tmp_dir/.gitignore"

cat > "$tmp_dir/README.md" <<EOF
# content branch

This branch stores authored content extracted from \`$source_ref\`.

Edit content here if you want to keep Markdown separate from theme and build files.
Bring the changes back to the main branch with:

\`\`\`bash
./scripts/import-content-branch.sh $content_branch
\`\`\`
EOF

(
  cd "$tmp_dir"
  git add --all

  if git diff --cached --quiet; then
    echo "No content changes to commit on '$content_branch'."
    exit 0
  fi

  git commit -m "sync content from $source_ref" >/dev/null
)

echo "Updated local branch '$content_branch' from '$source_ref'."

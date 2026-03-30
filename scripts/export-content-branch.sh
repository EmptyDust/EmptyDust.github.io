#!/usr/bin/env bash

set -euo pipefail

repo_root=$(git rev-parse --show-toplevel)
script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
paths_file="$script_dir/content-paths.txt"
content_branch="${1:-content}"
source_label="${2:-working tree}"

cd "$repo_root"

if [[ ! -f "$paths_file" ]]; then
  echo "Missing content paths file: $paths_file" >&2
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

branch_worktree=$(
  git worktree list --porcelain |
    awk -v branch="refs/heads/$content_branch" '
      $1 == "worktree" { path = $2 }
      $1 == "branch" && $2 == branch { print path; exit }
    '
)

cleanup_target=""

if [[ -n "$branch_worktree" ]]; then
  target_dir="$branch_worktree"
else
  target_dir=$(mktemp -d "${TMPDIR:-/tmp}/content-branch.XXXXXX")
  cleanup_target="$target_dir"

  if git show-ref --verify --quiet "refs/heads/$content_branch"; then
    git worktree add "$target_dir" "$content_branch" >/dev/null
  else
    git worktree add -b "$content_branch" "$target_dir" HEAD >/dev/null
  fi
fi

cleanup() {
  if [[ -n "$cleanup_target" ]]; then
    git worktree remove --force "$cleanup_target" >/dev/null 2>&1 || true
    rm -rf "$cleanup_target"
  fi
}

trap cleanup EXIT

find "$target_dir" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +

for path in "${content_paths[@]}"; do
  if [[ -e "$repo_root/$path" ]]; then
    mkdir -p "$target_dir/$(dirname "$path")"
    cp -R "$repo_root/$path" "$target_dir/$path"
  fi
done

if [[ -f "$repo_root/.gitignore" ]]; then
  cp "$repo_root/.gitignore" "$target_dir/.gitignore"
fi

cat > "$target_dir/README.md" <<EOF
# content branch

This branch stores authored content exported from the current working tree.

Edit content here if you want to keep Markdown separate from theme and build files.
Bring the changes back to the main branch with:

\`\`\`bash
./scripts/import-content-branch.sh $content_branch
\`\`\`
EOF

(
  cd "$target_dir"
  git add --all

  if git diff --cached --quiet; then
    echo "No content changes to commit on '$content_branch'."
    exit 0
  fi

  git commit -m "sync content from $source_label" >/dev/null
)

echo "Updated local branch '$content_branch' from '$source_label'."

#!/usr/bin/env bash

set -euo pipefail

repo_root=$(git rev-parse --show-toplevel)
theme_dir="$repo_root/themes/anzhiyu"
theme_repo="https://github.com/anzhiyu-c/hexo-theme-anzhiyu.git"
theme_branch="main"

if [[ -f "$theme_dir/_config.yml" ]]; then
  echo "Anzhiyu theme is already present."
  exit 0
fi

rm -rf "$theme_dir"
git clone -b "$theme_branch" "$theme_repo" "$theme_dir" >/dev/null

echo "Prepared Anzhiyu theme in '$theme_dir'."

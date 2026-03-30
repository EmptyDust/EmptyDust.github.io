# EmptyDust.github.io
Fengling's free website.

## Content Branch Workflow

This repo can keep written content on a separate `content` branch.

Content paths are defined in `scripts/content-paths.txt`.

- Run `./scripts/export-content-branch.sh` on `master` to refresh the `content` branch from the current branch.
- Run `./scripts/import-content-branch.sh` on `master` to pull content changes back from the `content` branch.
- Push the content branch with `git push origin content` when you want it on GitHub.

This avoids merging whole branches and only syncs the content directories you care about.

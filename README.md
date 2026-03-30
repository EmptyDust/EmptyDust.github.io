# EmptyDust.github.io
Fengling's free website.

## Branch Layout

- `master`: site code, Hexo config, themes, and deployment workflow
- `content`: authored Markdown and content data only
- `gh-pages`: generated static files published by GitHub Actions

Content paths are defined in `tools/content-paths.txt`.

## Content Workflow

Write content in the dedicated `content` worktree:

- `/Users/fengling/Github/EmptyDust.github.io-content`

When you need the Markdown files inside the `master` worktree for a local build:

- Run `./tools/import-content-branch.sh content`
- Run `./tools/prepare-anzhiyu-theme.sh`
- Then run your usual Hexo command such as `yarn build`

If you intentionally edited imported content inside the `master` worktree and want to push it back into `content`:

- Run `./tools/export-content-branch.sh content`

## Deploy Workflow

GitHub Actions now builds the site from:

- the latest `master` branch for code and build configuration
- the latest `content` branch for posts and page content

The deploy workflow runs on pushes to `master` or `content`, imports `origin/content` into the checked-out `master` tree, builds the site, and publishes to `gh-pages`.

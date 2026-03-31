# EmptyDust.github.io
Fengling's free website.

## Branch Layout

- `master`: site code, Hexo config, themes, and deployment workflow
- `content`: authored Markdown and content data only
- GitHub Actions: builds from `master + content` and syncs the generated `public/` directory to Rainyun over SSH

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

The deploy workflow runs on pushes to `master` or `content`, imports `origin/content` into the checked-out `master` tree, builds the site, and syncs `public/` to Rainyun with `rsync`.

## Rainyun Setup

Configure these GitHub Secrets before enabling deployment:

- `RAINYUN_HOST`: Rainyun server IP or domain
- `RAINYUN_PORT`: SSH port, usually `22`
- `RAINYUN_USER`: deploy user, for example `root`
- `RAINYUN_TARGET_DIR`: static site root on the server, for example `/var/www/emptydust`
- `RAINYUN_SSH_KEY`: private key used by GitHub Actions to log into the server
- `RAINYUN_POST_DEPLOY`: optional remote command after upload, for example `sudo systemctl reload nginx`
- `SITE_URL`: optional production site URL used during Hexo build
- `SITE_ROOT`: optional Hexo root, default `/`

See [docs/rainyun-deploy.md](docs/rainyun-deploy.md) for the server-side checklist and an example Nginx config.

# 修复生产镜像并重新部署最新提交

## Goal

Deploy the latest committed Mirror Island release to production so the public root opens the anonymous local-playtest menu without Keycloak login.

## Background

- Production currently serves an artifact built before commit `e4429b44` removed browser-side Keycloak.
- Remote `main` is `c72b5b6a`; the latest remote application commit is `a03fd2b9` on `codex/tool-interaction-mvp`, one fast-forward commit ahead of `main`.
- The previous `main` deployment failed before production replacement because the server runtime image contained the optional Prisma CLI and violated the workflow image-boundary check.
- The working directory contains unrelated committed-index and uncommitted work that must not enter this release.

## Requirements

- Build the release from committed state rooted at `a03fd2b9`, plus only the minimal production-image fix required for deployment.
- Use an isolated Git worktree so the current workspace and its staged/unstaged files remain untouched.
- Keep Prisma Client and the PostgreSQL adapter available to `mirror-game`, while excluding the optional Prisma CLI and configuration package from its runtime image.
- Run the smallest relevant client, server, Compose, and runtime-image boundary checks before publishing.
- Fast-forward remote `main`; do not force-push or rewrite history.
- Use the existing GitHub Actions production workflow, including the user-authorized database backups, existing migration deployment, and already-approved legacy cleanup steps.
- Follow the production run to completion and verify the public root no longer ships or initializes Keycloak.

## Acceptance Criteria

- [x] The release commit is a descendant of `a03fd2b9` and excludes the current workspace's unrelated changes.
- [x] The production server image contains no Prisma CLI/config package and its server runtime still builds.
- [x] The production frontend bundle contains no `keycloak-js`, `/identity` client configuration, or `login-required` initialization.
- [x] GitHub Actions completes the production deployment successfully from `main`.
- [x] `https://fable.pingxingxian.space/` serves the new asset hash and exposes anonymous new/continue-game UI without redirecting to login.
- [x] `/mirror-island` still redirects to `/`, and retained identity/forum endpoints remain healthy according to the deployment workflow.

## Out of Scope

- Deploying staged or unstaged gameplay work created after `a03fd2b9`.
- Schema changes, new migrations, or manual production database queries.
- Changing the retained Keycloak or forum OIDC backend contracts.

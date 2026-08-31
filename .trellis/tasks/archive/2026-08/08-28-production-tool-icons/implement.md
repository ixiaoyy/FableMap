# Implementation Plan

## 1. Isolate and prepare publication

1. Create a dedicated worktree/branch from the current remote `main`.
2. Add the exact IvoryRed object key to `.github/workflows/publish-media.yml` with PNG and `game` prefix checks.
3. Validate the workflow diff, commit it separately, and fast-forward only that allowlist commit to `main`.

## 2. Publish the immutable object

1. Dispatch `publish-game-media` with the local exact PNG encoded in the API payload, expected bytes/hash, MIME type, and reviewed object key.
2. Wait for the publication workflow to succeed.
3. Verify the public URL's bytes, SHA-256, 160×176 dimensions, `image/png`, and immutable cache policy.

## 3. Promote the runtime icons

1. Add the GARDENS manifest entry and update totals/date.
2. Add `item-icons.ts`; update `Hotbar.vue` to use it without a dev gate.
3. Remove only the now-duplicated Hotbar mapping from `tool-art-candidate.ts`; preserve development action candidates.
4. Add `public/THIRD_PARTY_NOTICES.txt`, public footer link, asset adoption record, and open-source adoption note.

## 4. Verify and release

1. Run media-manifest structural verification against an object listing that includes the new exact key.
2. Run public CDN verification, typecheck, client build, and static searches proving production Hotbar is not dev-gated.
3. Confirm Git tracks no new image binary and review the exact release diff.
4. Commit and push the release branch; before fast-forwarding `main`, confirm authorization for the standard deployment workflow's production database backup/migration steps.
5. Follow GitHub Actions through deployment and verify the live Hotbar plus product notice in Chrome.

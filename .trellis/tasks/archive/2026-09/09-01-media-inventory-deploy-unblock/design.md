# 媒体账本部署门禁修复：技术设计

## Boundary

修复只同步“已存在 CDN 对象集合”与“仓库 manifest/校验器合同”。它不激活音频运行时，也不改变首页、GameSession、IndexedDB 或部署拓扑。

## Data Contract

```text
S3 game/media/v1 objects (15 image + 19 audio)
        ↕ exact key / bytes
game-media-manifest.json
        ↓ schema + totals
verify_media_manifest.py
        ↓ public bytes / hash / MIME / cache / PNG dimensions
verify_cdn_assets.py
```

## Compatibility

- 图片继续要求 `image/png` 和正整数 `width`/`height`。
- 音频只允许 `audio/ogg`、`audio/mpeg`、`audio/wav`，禁止 `width`/`height`。
- 顶层图片和音频分别统计，避免音频加入后破坏历史图片总数合同。
- 部署仍保持 fail-closed：manifest 之外的远端对象继续阻断发布。

## Git Safety

- 新 PR 从 GitHub 当前 `main` commit 建立干净 worktree。
- 三个文件从当前已验证音频 WIP 精确复制；PR diff 必须再次枚举。
- 当前本地混合提交只创建安全分支引用，不改写或推送。

## Rollback

若三文件 PR 失败，只关闭/回滚该 PR；不删除 CDN 对象。由于远端对象已存在，回滚 manifest 会重新触发 strict unexpected-object 门禁，因此 forward-fix 优先。

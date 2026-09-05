# 媒体账本部署门禁修复：实施计划

1. 创建本地安全分支固定当前音频 WIP commit/工作树状态，不改写历史。
2. 从 GitHub 当前 `main` commit 建立干净修复 worktree。
3. 只复制 manifest 与两个媒体校验器，核对 diff 文件数等于 3。
4. 运行 manifest schema/totals 校验与 34 项公开 CDN 全量校验。
5. 提交、推送、创建 PR；检查 files/commits/mergeability 后合并。
6. 等待 `Deploy Mirror Island` 完成；失败时只读日志并窄修复。
7. 在生产浏览器验收新首页、主视觉和 console。
8. 更新任务证据、归档并记录 session。

## Verification

```powershell
python deploy/cdn/verify_cdn_assets.py --manifest deploy/cdn/game-media-manifest.json
python -c "... _validate_manifest(...) ..."
git diff --check
```

## Rollback Points

- PR 创建前：干净 worktree 可直接移除，不触碰主工作区。
- PR 合并前：文件列表不是精确三个即停止。
- PR 合并后：不删除已发布对象；根据部署日志 forward-fix。

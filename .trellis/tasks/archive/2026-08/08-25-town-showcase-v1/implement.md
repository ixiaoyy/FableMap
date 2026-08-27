# 实施计划

## Gate 0 — restore originals

1. 扩展 publisher allowlist 与新增 exact retired-media deletion workflow。
2. 先把 allowlist 推送 main，不触发应用部署。
3. 上传并验证 6 张原始官方 PNG。
4. 恢复正式 Farm TMJ 原始 GID/tileset metadata，更新 Phaser frame、prepare-media、manifest 与文档。
5. 运行 Farm decoder、23 stable object equality、route replay、Life Loop tests、typecheck、client build。
6. 推送 main 部署并验证 Farm 画面、Cottage/Town 连通和 CDN 原图。
7. 精确删除 5 个 CDN 派生对象与所有本地 packed outputs/builder，确认代码/manifest 无旧引用。

## Gate A — Town candidate

8. 基于正式 Town stable objects 创建 ignored full-original candidate。
9. 只铺主街、小广场、Seed Shop 和两栋外观建筑，完成基础 Collision。
10. 解码候选、回放 Farm→Town→Seed Shop 路线并渲染截图。
11. 提交 Town 整图与实际到达比例截图给用户；未经确认不替换正式 Town。

## Verification

- 6 个 original CDN SHA/尺寸/MIME/immutable cache。
- Git tracked image binaries = 0。
- Farm 正式视觉与对象/碰撞合同不回退。
- Town candidate 现有 stable IDs 完全相同。
- 最小自动检查：Life Loop contracts、typecheck、client build、candidate decoder/route。

## Rollback points

- originals 未全部上传：不切 runtime。
- Farm 对比不一致：不部署、不删派生。
- 生产仍引用任一旧 key：不执行 CDN/local deletion。
- Town Gate A 未获确认：只保留 ignored candidate，不改正式 Town。

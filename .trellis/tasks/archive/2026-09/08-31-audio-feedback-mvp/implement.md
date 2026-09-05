# 声音与环境反馈 MVP：执行计划

1. 核对并行首页任务对 workflow、manifest、prepare-media、App/style/media-catalog 的完整 diff，确定只追加不覆盖的合并点。
2. 从官方 CC0 来源下载候选到 Git ignored/临时目录，逐文件检查许可、名称、时长、声道、采样率和适用 cue。
3. 选择最小真实子集；用现有/成熟 CLI 工具做可重复 trim/normalize/fade/OGG 转码，保存处理记录和源/产物 SHA-256。
4. 通过仓库现有 `publish-game-media` 精确 allowlist 发布不可变音频对象；回读 CDN 验证 status/MIME/bytes/SHA/cache。
5. 精确扩展 `game-media-manifest.json`、媒体来源记录、`prepare-media.mjs`、发布 workflow 和 notices；确认 Git 音频二进制为零。
6. 新增 audio settings/catalog/events/director，所有方法/helper 添加方法级注释。
7. 在 Phaser/Vue/session 的现有 impact/result/transition/page/sleep 路径接入语义 cue；不复制 domain mutation 判断。
8. 增加 SettingsPanel 和现有 modal/input-lock 的窄集成，避免改写并行首页布局。
9. 加一个低成本设置 decoder/cue mapping 合同；不建设音频 E2E 或大测试矩阵。
10. 运行一次最小相关合同、typecheck、build:client、manifest/二进制审计；更新真人听音清单。

风险点：CDN 上传必须先验证不可变 key；浏览器 autoplay 失败不能阻塞游戏；并行媒体文件不能整文件替换；实际音色由真人验收，不用“代码触发成功”冒充听感通过。

## Validation record — 2026-09-01

- 发布 bootstrap：`88790b8c chore: allow reviewed game audio publication` 已安全快进到 `origin/main`，只修改发布 workflow。
- 19/19 个 `publish-game-media` GitHub Actions run 成功；公共 CDN 并行回读 19/19 音频与完整 34/34 manifest，bytes、SHA-256、MIME、immutable cache 全部匹配。
- `npm run prepare:media`：成功准备 34 个媒体对象，其中 19 个音频位于 Git ignored `public/game-media/v1`；Git tracked audio binary 为 0。
- `test:town-population`：9/9（原 6 项 + audio settings/cue/ambience 3 项）。
- `typecheck`：通过；`build:client`：通过，保留既有主包超过 500 kB 的非阻塞提示。
- 质量自查补齐石头实际触发：近距离点击只播放表现震动/stone cue 并提示不可开采，不新增掉落、物品或存档。
- 并行首页提交在共享索引中意外带入声音独占代码，记录于 `ff07d583`；缺失的 App/style/media/manifest/test 集成已由 `bea15436 feat: wire published game audio assets` 补齐。未重写或撤销并行任务历史。
- 项目 code-spec 已记录 audio settings、semantic cue、ambience lifecycle 和 manifest audio contract。
- 真人验收仍待用户安排：实际音色/响度、循环接缝、盲听地点区分、手机、200% zoom 和 autoplay 手感；未伪造为 Agent 通过，也不阻塞代码交付。

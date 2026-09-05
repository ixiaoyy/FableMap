# 镜像岛文档索引

1. [README](../README.md) — 仓库入口、技术栈、本地命令和最小验证。
2. [CURRENT_STATE](CURRENT_STATE.md) — 当前实现、验收、活跃任务、冻结范围和记忆读取优先级。
3. [PRODUCT_BRIEF](PRODUCT_BRIEF.md) — 单人世界目标、玩法合同和成功标准。
4. [镜像岛探索设计原则](EXPLORATION_DESIGN_PRINCIPLES.md) — 手工微发现、环境线索、已有动作、反馈、奖励和范围约束。
5. [WHAT_NOT_TO_BUILD](WHAT_NOT_TO_BUILD.md) — 永久禁区与当前范围边界。
6. [IMAGE_ASSETS_SPEC](IMAGE_ASSETS_SPEC.md) — 开源素材许可、署名、CDN、manifest 和哈希合同。
7. [DEPLOYMENT](DEPLOYMENT.md) — 生产拓扑、密钥、迁移、健康检查和清退边界。
8. [Mirror Island Phaser 单人规范](../.trellis/spec/frontend/mirror-island-phaser-singleplayer.md) — 工程合同。
9. [Farm Showcase Checkpoint](checkpoints/farm-showcase-v1/README.md) — Farm v1 历史视觉冻结、证据哈希和人工验收记录。
10. [Life Loop v1 Checkpoint](checkpoints/life-loop-v1/README.md) — Life Loop v1 历史发布与验收记录。
11. [Town 后续开发路线图](TOWN_ROADMAP.md) — 已实现基线、明确延期能力、依赖顺序和后续任务触发条件。
12. [现阶段精细化验收门禁](CURRENT_SLICE_POLISH_GATE.md) — 功能、动作、地图、人物、交互、看板与 UI 的真实路线精细化门禁。

Character、StoryWorld、StoryRun、Phaser 本地农场、LLM 和旧 FableSpace 数据库不再是当前文档或运行时的一部分。不要从 Git 历史恢复这些能力建立兼容层。

Checkpoint 与 workspace journal 保存当时的历史条件；判断当前状态时先读取 `CURRENT_STATE.md`，不要把旧账号验收或旧 save 版本当成现行合同。

# 远征 Domain v9：实施计划

> **已否决（2026-09-04）**：不得执行以下步骤；内容仅保留历史证据。

1. 搜索 v8 version、decoder、clone、migration、inventory capacity 与 GameSession command/result owners。
2. 添加 closed expedition definitions 和纯 `ExpeditionSystem`；每个方法/helper 添加方法级注释。
3. 实现 v9 GameState/StoredGame 与唯一 v8→v9 migration，run 字段禁止进入 decoder。
4. 接入 GameSession nullable runtime run、safe checkpoint、loot/damage/capture/choice/discard/extract commands。
5. 实现 extraction clone/validate/commit/rollback 和重复命令幂等。
6. 更新窄 fixtures/合同：v1–v9、unknown IDs、home byte equality、capacity、capture、event、extract once。
7. 运行 `test:life-loop`、`test:town-population`、typecheck；生产代码通过后精确暂存。

## Risk Gates

- 写代码前确认所有 version/decoder 消费者；同需求只允许一个 v9 value migration。
- 不修改 TMJ、Phaser、媒体、数据库、server 或 UI。
- 若 runtime run 被迫持久化，立即退回父任务重新评审，不自行扩 schema。

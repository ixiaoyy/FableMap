# 2026-03-10 文化诠释框架与视觉气质宣言补充说明

## 本次做了什么

- 新增 `docs/CULTURAL_INTERPRETATION.md`
- 新增 `docs/STYLE_VIBES_MANIFESTO.md`
- 在 `README.md` 文档导航中加入两份新文档入口
- 补充本次文档切片对应的认领说明与变更说明

## 为什么要做

此前仓库已经有产品方向、Schema 与审美系统规划，但还缺两类关键中层文档：

- 一类定义“现实地点为什么会被翻译成这种异世界语义”
- 一类定义“同一份世界数据如何在不同视觉/情绪镜头下被观看”

补上这两份文档后，后续做规则生成、文案约束、Godot 呈现和 Aesthetic Kernel 时，会有更稳定的术语边界与风格口径。

## 影响范围

- 新开发者理解 FableMap 世界观翻译逻辑的速度
- 后续 `fantasy_type` / `satire_hook` / `emotion_hook` 等字段的设计一致性
- 后续 `visual_style` / `vibe_profile` / `palette_hint` 等字段的使用边界
- README 的文档可发现性

## 明确没有改什么

- 没有修改 Python 运行时代码
- 没有修改 CLI 参数或命令行为
- 没有修改世界 Schema 结构
- 没有新增依赖或外部服务接入
- 没有直接实现 `Street as a Sentence`、`Causal Ripple Algorithm` 或 Godot 视觉逻辑

## 是否涉及协议 / Schema / 命名变更

- 不涉及协作协议变更
- 不涉及 Schema 结构变更
- 不涉及运行时命名或 CLI 参数变更
- 属于设计文档层的补充与口径收敛

## 验证方式

- 检查两份新文档术语是否与 `docs/WORLD_SCHEMA.md`、`docs/AESTHETIC_EMOTION_SYSTEMS.md` 一致
- 检查 `README.md` 导航是否正确暴露新文档
- 执行 `git diff --check`，确认文档改动格式正常

## 风险点

- 这两份文档目前仍是设计边界，不等于机器可直接消费的数据字典
- 若后续要让程序直接消费这些语义和 vibe 定义，应另补结构化 JSON 或规则配置文件
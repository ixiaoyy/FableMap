# 2026-03-11 Causal Ripple Algorithm 正式设计稿补充说明

## 本次做了什么

- 新增 `docs/CAUSAL_RIPPLE_ALGORITHM.md`
- 将 `Causal Ripple Algorithm` 从 README 中的未来设计钩子提升为正式设计文档
- 在 `README.md` 文档导航中加入新文档入口
- 补充本次文档切片对应的认领说明与变更说明

## 为什么要做

此前仓库已经有：

- 区域级的《动态扰动模型》
- 街道序列级的《Street as a Sentence》
- 单点语义级的《文化诠释框架》

但还缺少一个中层机制，去解释：

- 单点事件为什么会向周边街区扩散
- 为什么扩散不只影响距离最近的点，还会沿路网、街句、阵营和资源链传播
- 为什么一个事件会同时改写区域张力、经济流、异常压力与镜头气质

这份文档就是为这个“事件 -> 传播 -> 状态写回”的问题提供正式设计骨架。

## 影响范围

- 后续事件传播与区域动态系统的设计方向
- `region.social_tension`、`region.commerce_flux`、`region.anomaly_pressure`、`region.vibe_profile` 等字段的解释链路
- `state.story_events`、`state.route_impact`、`state.resource_transfers`、`state.active_lens` 等状态容器的上游设计依据
- README 的文档可发现性

## 明确没有改什么

- 没有修改 Python 运行时代码
- 没有修改 CLI 参数或命令行为
- 没有修改当前世界 Schema 结构
- 没有直接实现 ripple 规则引擎、实时仿真或在线联机逻辑
- 没有直接落地 inspect 子命令、Collective Myth 或 Godot 端表现系统

## 是否涉及协议 / Schema / 命名变更

- 不涉及协作协议变更
- 不涉及 Schema 结构变更
- 不涉及运行时命名或 CLI 参数变更
- 属于设计文档层的正式化与术语收敛

## 验证方式

- 检查新文档术语是否与 `docs/WORLD_SCHEMA.md`、`docs/DISTURBANCE_MODEL.md`、`docs/STREET_AS_A_SENTENCE.md`、`docs/CULTURAL_INTERPRETATION.md`、`docs/STYLE_VIBES_MANIFESTO.md` 一致
- 检查 `README.md` 导航是否正确暴露新文档
- 执行 `git diff --check`，确认文档改动格式正常

## 风险点

- 当前设计稿仍然是“可实现框架”，不是直接可运行的传播系统
- 若后续要进入实现阶段，应再补结构化规则、示例输入输出、可解释调试输出与模块认领说明
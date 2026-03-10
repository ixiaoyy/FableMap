# 2026-03-10 Street as a Sentence 正式设计稿补充说明

## 本次做了什么

- 新增 `docs/STREET_AS_A_SENTENCE.md`
- 将 `Street as a Sentence` 从 README 中的未来设计钩子提升为正式设计文档
- 在 `README.md` 文档导航中加入新文档入口
- 补充本次文档切片对应的认领说明与变更说明

## 为什么要做

此前仓库已经有：

- 单点地点的文化诠释框架
- 区域镜头级的视觉气质边界

但还缺少一个中层方法，去解释：

- 多个地点如何按顺序组成一条街的整体气质
- 为什么某条街会被读成“通勤句”“压迫句”或“温柔缓冲句”
- 区域叙事摘要、vibe 候选和局部钩子如何从真实空间结构中推导出来

这份文档就是为这个中层问题提供正式设计骨架。

## 影响范围

- 后续区域叙事生成方法的设计方向
- `region.narrative_summary`、`region.theme`、`region.vibe_profile` 等字段的推导逻辑
- 后续 NPC 语气、音景与镜头系统的上游依据
- README 的文档可发现性

## 明确没有改什么

- 没有修改 Python 运行时代码
- 没有修改 CLI 参数或命令行为
- 没有修改当前世界 Schema 结构
- 没有直接实现街句算法、打分器或机器可读规则文件
- 没有直接实现 Ethereal Radio 或 Causal Ripple 的独立系统逻辑

## 是否涉及协议 / Schema / 命名变更

- 不涉及协作协议变更
- 不涉及 Schema 结构变更
- 不涉及运行时命名或 CLI 参数变更
- 属于设计文档层的正式化与术语收敛

## 验证方式

- 检查新文档术语是否与 `docs/WORLD_SCHEMA.md`、`docs/CULTURAL_INTERPRETATION.md`、`docs/STYLE_VIBES_MANIFESTO.md` 一致
- 检查 `README.md` 导航是否正确暴露新文档
- 执行 `git diff --check`，确认文档改动格式正常

## 风险点

- 当前设计稿仍然是“可实现框架”，不是直接可运行的规则系统
- 若后续要进入实现阶段，应再补结构化配置、示例输入输出与模块认领说明
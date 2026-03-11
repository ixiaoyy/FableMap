# 模块认领说明

- 模块名 / 区域名：Causal Ripple Algorithm 正式设计稿
- 负责人：Augment Agent
- 改动类型：文档
- 当前状态：complete

## 目标

把 README 中的 `Causal Ripple Algorithm` 从未来设计钩子提升为正式设计文档，明确：

- 单点事件如何向周边街区传播
- 传播会影响哪些层：阵营、经济、情绪、异常与审美
- 它如何回落到现有 Schema 与世界状态
- 它与动态扰动模型、Street as a Sentence 的衔接关系

## 计划修改范围

- 新增 `docs/CAUSAL_RIPPLE_ALGORITHM.md`
- 按需更新 `README.md` 文档导航
- 新增本次提交对应的 `docs/changes/...` 说明文档

## 明确不改范围

- 不修改 Python 运行时代码
- 不修改 CLI 接口
- 不修改当前世界 Schema 结构
- 不直接实现传播算法、实时同步或在线数据接入
- 不在本次直接落地 inspect 子命令或 Godot 端表现逻辑

## 依据的协议文档

- `README.md`
- `CONTRIBUTING.md`
- `docs/AI参与开发协议.md`
- `docs/WORLD_SCHEMA.md`
- `docs/DISTURBANCE_MODEL.md`
- `docs/STREET_AS_A_SENTENCE.md`
- `docs/CULTURAL_INTERPRETATION.md`
- `docs/STYLE_VIBES_MANIFESTO.md`

## 预期产出

- 一份 `Causal Ripple Algorithm` 正式设计文档
- README 导航补充（如需要）
- 一份本次 commit 说明文档

## 验证方式

- 检查新文档术语是否与现有 Schema、动态扰动、街句与审美文档一致
- 检查 README 导航是否能正确暴露新文档
- 执行 `git diff --check`

## 风险与备注

- 本次目标是建立可实现、可约束实现边界的设计框架，不追求一次写死全部公式与权重
- 若后续进入实现阶段，应再补结构化规则、示例输入输出与模块认领说明
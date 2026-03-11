# 2026-03-11 Causal Ripple 机器可读规则草案补充说明

## 本次做了什么

- 新增 `docs/CAUSAL_RIPPLE_RULES_V0.1.json`
- 将上一轮 `Causal Ripple Algorithm` 设计稿继续推进为机器可读规则草案
- 在 `docs/CAUSAL_RIPPLE_ALGORITHM.md` 中补充规则草案落点说明
- 在 `README.md` 文档导航中加入 JSON 草案入口
- 补充本次文档切片对应的认领说明与变更说明

## 为什么要做

此前仓库已经有 `Causal Ripple Algorithm` 的正式设计稿，但它仍然主要停留在“概念与方法”层。

如果后续要进入实现阶段，还需要再往前推进一步，把以下内容先结构化：

- 事件类型
- 传播载体
- 影响层
- 上下文修饰项
- 状态写回目标

这份 JSON 草案的目的，就是把这些内容先整理成程序未来可消费的配置骨架，降低从设计稿进入实现时的歧义成本。

## 影响范围

- 后续 ripple 解释器 / 规则引擎的配置设计方向
- `region.*` 与 `state.*` 相关字段的写回优先级表达方式
- 后续 `inspect` 工具可能输出的传播解释结构
- README 的文档可发现性

## 明确没有改什么

- 没有修改 Python 运行时代码
- 没有修改 CLI 参数或命令行为
- 没有修改当前世界 Schema 结构
- 没有直接实现 ripple 解释器、调度器或实时仿真逻辑
- 没有直接引入 Reality Distortion Engine、Collective Myth 或 Godot 运行时接线

## 是否涉及协议 / Schema / 命名变更

- 不涉及协作协议变更
- 不涉及 Schema 结构变更
- 不涉及运行时命名或 CLI 参数变更
- 属于设计文档进一步结构化为机器可读草案

## 验证方式

- 检查 JSON 草案中的术语是否与 `docs/CAUSAL_RIPPLE_ALGORITHM.md`、`docs/WORLD_SCHEMA.md`、`docs/DISTURBANCE_MODEL.md`、`docs/STREET_AS_A_SENTENCE.md` 一致
- 使用 `python -m json.tool docs/CAUSAL_RIPPLE_RULES_V0.1.json` 校验 JSON 语法
- 执行 `git diff --check`，确认文档改动格式正常

## 风险点

- 当前 JSON 仍是“设计草案”，不是稳定 API 契约
- 若后续直接用于实现，应再补字段约束、默认值继承策略、优先级冲突规则与示例输入输出
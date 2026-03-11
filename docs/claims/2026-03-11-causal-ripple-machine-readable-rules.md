# 模块认领说明

- 模块名 / 区域名：Causal Ripple 机器可读规则草案
- 负责人：Augment Agent
- 改动类型：文档
- 当前状态：complete

## 目标

把 `docs/CAUSAL_RIPPLE_ALGORITHM.md` 中的设计稿，进一步整理成一份机器可读规则草案，明确：

- 事件类型如何以结构化配置表达
- 传播载体、影响层与上下文修饰如何被程序消费
- 规则结果优先写回哪些现有 Schema 字段
- v0.1 阶段哪些内容只是规则草案，哪些还不是运行时契约

## 计划修改范围

- 新增 `docs/CAUSAL_RIPPLE_RULES_V0.1.json`
- 按需更新 `docs/CAUSAL_RIPPLE_ALGORITHM.md`
- 按需更新 `README.md` 文档导航
- 新增本次提交对应的 `docs/changes/...` 说明文档

## 明确不改范围

- 不修改 Python 运行时代码
- 不修改 CLI 接口
- 不修改当前世界 Schema 结构
- 不直接实现 ripple 规则引擎或 inspect 输出
- 不在本次直接扩展到 Reality Distortion Engine 或 Collective Myth 长期系统

## 依据的协议文档

- `README.md`
- `CONTRIBUTING.md`
- `docs/AI参与开发协议.md`
- `docs/WORLD_SCHEMA.md`
- `docs/CAUSAL_RIPPLE_ALGORITHM.md`
- `docs/DISTURBANCE_MODEL.md`
- `docs/STREET_AS_A_SENTENCE.md`
- `docs/CULTURAL_INTERPRETATION.md`

## 预期产出

- 一份 `Causal Ripple` 机器可读规则草案 JSON
- 设计稿中的引用或说明补充（如需要）
- README 导航补充（如需要）
- 一份本次 commit 说明文档

## 验证方式

- 检查 JSON 草案中的术语是否与现有设计文档和 Schema 一致
- 使用 `python -m json.tool` 校验 JSON 语法
- 执行 `git diff --check`

## 风险与备注

- 本次产出是“规则草案”，不是稳定 API 或最终配置协议
- 若后续进入实现阶段，应再补字段约束、默认值策略与解释器模块认领说明
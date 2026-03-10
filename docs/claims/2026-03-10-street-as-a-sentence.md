# 模块认领说明

- 模块名 / 区域名：Street as a Sentence 正式设计稿
- 负责人：Augment Agent
- 改动类型：文档
- 当前状态：complete

## 目标

把 README 中的 `Street as a Sentence` 从未来设计钩子提升为正式设计文档，明确：

- 街道语义序列的核心定义
- POI、roads、landmarks 如何共同形成“句子”
- 该方法如何沉淀到现有 Schema 字段
- 它与文化诠释、视觉气质、动态扰动和后续生成链路的关系

## 计划修改范围

- 新增 `docs/STREET_AS_A_SENTENCE.md`
- 按需更新 `README.md` 文档导航
- 新增本次提交对应的 `docs/changes/...` 说明文档

## 明确不改范围

- 不修改 Python 运行时代码
- 不修改 CLI 接口
- 不修改当前世界 Schema 结构
- 不直接实现算法、打分器或训练数据
- 不在本次直接落地 Ethereal Radio 或 Causal Ripple 的独立设计稿

## 依据的协议文档

- `README.md`
- `CONTRIBUTING.md`
- `docs/AI参与开发协议.md`
- `docs/WORLD_SCHEMA.md`
- `docs/CULTURAL_INTERPRETATION.md`
- `docs/STYLE_VIBES_MANIFESTO.md`

## 预期产出

- 一份 `Street as a Sentence` 正式设计文档
- README 导航补充（如需要）
- 一份本次 commit 说明文档

## 验证方式

- 检查新文档术语是否与现有 Schema、文化诠释与视觉气质文档一致
- 检查 README 导航是否能正确暴露新文档
- 执行 `git diff --check`

## 风险与备注

- 本次目标是建立可讨论、可扩展的设计框架，不追求一次定死全部语法
- 若后续要让程序直接消费，应再补结构化规则、权重配置或示例数据文件
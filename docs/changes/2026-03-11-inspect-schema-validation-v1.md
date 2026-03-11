# 2026-03-11 inspect 最小结构校验增强说明

## 本次做了什么

- 为 `python -m fablemap inspect` 增加最小 world schema 校验
- 在读取世界文件后校验顶层关键字段与 `source.provider`、`state.version`
- 对 schema 校验失败的输入返回更明确的 CLI 退出码与错误信息
- 为非法 world 文件场景补充 CLI 单元测试
- 更新 `README.md` 中对 inspect 当前能力的描述

## 为什么要做

`inspect` 第一版已经能输出稳定摘要，但它默认假设输入文件是合法的世界文件。

随着仓库进入持续迭代阶段，开发时需要更早识别“文件能读，但结构不对”的情况；否则错误会混在普通异常里，不利于后续自动化验证和更深的工具链接入。

这次增强的目标，就是把 `inspect` 从“能读摘要”推进到“能识别明显非法输入”的阶段。

## 影响范围

- `fablemap/cli.py`
- `tests/test_cli.py`
- `README.md`
- `docs/claims/2026-03-11-inspect-schema-validation-v1.md`

## 明确没有改什么

- 没有修改 `world_builder` 的生成语义
- 没有修改世界 Schema 结构
- 没有引入完整 schema 解释器或外部 schema 文件
- 没有实现 inspect 的 diff、因果解释或深度诊断模式
- 没有实现 `cache` 子命令

## 是否涉及协议 / Schema / 命名变更

- 不涉及协议变更
- 不涉及 Schema 结构变更
- 不涉及既有 `generate` 命令参数变更
- 属于 inspect CLI 的可靠性增强

## 验证方式

- 运行 `python -m unittest tests/test_cli.py`
- 运行 CLI smoke：先 `generate` 生成世界，再 `inspect` 读取摘要
- 构造非法 world 文件，确认 `inspect` 返回 schema 校验错误
- 执行 `git diff --check`

## 风险点

- 当前只做最小结构校验，不覆盖全部未来字段
- 若后续继续扩展为完整 schema 校验器，应统一错误聚合、字段约束与版本兼容策略
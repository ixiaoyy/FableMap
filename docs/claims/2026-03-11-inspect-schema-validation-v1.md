# 模块认领说明

- 模块名 / 区域名：inspect 最小结构校验增强
- 负责人：Augment Agent
- 改动类型：功能
- 当前状态：complete

## 目标

为 `python -m fablemap inspect` 增加第一版最小结构校验能力，在读取已有 `world.json` 后，确认其是否具备当前 Schema 所要求的顶层字段与关键状态字段；对明显不合法的输入返回更清晰的校验错误。

本次重点解决：

- `inspect` 如何识别“不是合法世界文件”的输入
- 如何把结构校验失败与一般读文件错误区分开
- 如何在不修改 `world_builder` 生成语义的前提下增强 inspect 可靠性

## 计划修改范围

- 更新 `fablemap/cli.py`
- 更新 `tests/test_cli.py`
- 按需更新 `README.md`
- 新增本次提交对应的 `docs/changes/...` 说明文档

## 明确不改范围

- 不修改 `world_builder` 的世界生成语义
- 不修改世界 Schema 结构
- 不实现完整 schema 解释器或外部 schema 文件
- 不实现 `cache` 子命令
- 不实现 inspect 的 diff、因果解释或深度诊断模式

## 依据的协议文档

- `README.md`
- `CONTRIBUTING.md`
- `docs/AI参与开发协议.md`
- `docs/WORLD_SCHEMA.md`
- `docs/CLI_SPEC.md`

## 预期产出

- `inspect` 的最小结构校验能力
- 针对 schema 校验失败的 CLI 测试
- README 现状描述更新（如需要）
- 一份本次 commit 变更说明文档

## 验证方式

- 运行 `python -m unittest tests/test_cli.py`
- 运行最小 CLI smoke test：先 `generate` 输出世界，再 `inspect` 读取摘要
- 人工构造非法 world JSON，确认 `inspect` 返回 schema 校验错误
- 执行 `git diff --check`

## 风险与备注

- 本次只做最小结构校验，不承诺完整 schema 覆盖率
- 校验字段需要优先复用当前 `docs/WORLD_SCHEMA.md` 与 `world_builder` 已稳定输出的结构
- 退出码增强应避免破坏已有 `generate` 运行路径
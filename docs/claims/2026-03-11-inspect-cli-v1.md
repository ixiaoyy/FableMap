# 模块认领说明

- 模块名 / 区域名：inspect 子命令第一版
- 负责人：Augment Agent
- 改动类型：功能
- 当前状态：complete

## 目标

为 `python -m fablemap` 增加第一版 `inspect` 子命令，支持读取已有 `world.json` 并输出稳定摘要，帮助开发阶段快速确认生成结果结构是否合理。

本次重点解决：

- 如何通过 `--input` 读取世界文件
- 如何输出一份稳定、紧凑、可测试的摘要结果
- 如何在不影响 `generate` 现有行为的前提下扩展 CLI

## 计划修改范围

- 更新 `fablemap/cli.py`
- 更新 `tests/test_cli.py`
- 按需更新 `README.md`
- 新增本次提交对应的 `docs/changes/...` 说明文档

## 明确不改范围

- 不修改 `world_builder` 的世界生成语义
- 不修改世界 Schema 结构
- 不实现 `cache` 子命令
- 不实现 inspect 的深度规则解释、diff 或诊断模式
- 不修改 Godot 消费层

## 依据的协议文档

- `README.md`
- `CONTRIBUTING.md`
- `docs/AI参与开发协议.md`
- `docs/WORLD_SCHEMA.md`
- `docs/CLI_SPEC.md`

## 预期产出

- `inspect --input` CLI 能力
- 对应的单元测试
- README 现状描述更新（如需要）
- 一份本次 commit 变更说明文档

## 验证方式

- 运行 `python -m unittest tests/test_cli.py`
- 运行最小 CLI smoke test：先 `generate` 输出世界，再 `inspect` 读取摘要
- 执行 `git diff --check`

## 风险与备注

- 第一版 `inspect` 只提供稳定摘要，不承担 schema 全量校验职责
- 摘要字段需要尽量复用现有世界文件中的稳定字段，避免过早承诺复杂输出格式
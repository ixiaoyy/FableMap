# 2026-03-11 inspect 子命令第一版补充说明

## 本次做了什么

- 为 `python -m fablemap` 增加 `inspect` 子命令
- 支持通过 `--input` 读取已有世界 JSON 文件
- 输出一份稳定、紧凑、便于测试的世界摘要 JSON
- 为 `inspect` 增加对应 CLI 单元测试
- 更新 `README.md` 中的当前模块与项目状态描述

## 为什么要做

当前仓库已经能生成 `world.json`，但开发时仍缺一个最小读取入口，用来快速确认生成结果是否合理。

`inspect` 第一版的作用，是把“生成结果存在”推进到“生成结果可快速查看、可脚本化验证”的阶段，为后续更深入的解释、diff、规则追踪输出留一个稳定入口。

## 影响范围

- `fablemap/cli.py`
- `tests/test_cli.py`
- `README.md`
- `docs/claims/2026-03-11-inspect-cli-v1.md`

## 明确没有改什么

- 没有修改 `generate` 的现有参数与输出行为
- 没有修改 `world_builder` 的生成语义
- 没有修改世界 Schema 结构
- 没有实现 `cache` 子命令
- 没有实现 inspect 的 schema 全量校验、diff 或因果解释模式

## 是否涉及协议 / Schema / 命名变更

- 不涉及协议变更
- 不涉及 Schema 结构变更
- 不涉及既有生成命名变更
- 属于 CLI 功能补充

## 验证方式

- 运行 `python -m unittest tests/test_cli.py`
- 运行 CLI smoke：先 `generate` 生成世界，再 `inspect` 读取摘要
- 执行 `git diff --check`

## 风险点

- 当前 `inspect` 仍是第一版，只提供稳定摘要，不提供深入解释
- 若后续继续扩展，应谨慎维护摘要字段的稳定性，避免过早引入频繁变动的输出契约
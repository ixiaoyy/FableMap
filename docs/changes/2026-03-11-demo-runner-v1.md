# 2026-03-11 repo 内最小 demo runner 第一版说明

## 本次做了什么

- 新增 `fablemap/demo.py`，提供一个可本地直接运行的 demo 入口
- 新增 repo 内固定 demo fixture 资产，用于稳定生成示例世界
- demo 运行后会输出 `world.json` 与 `summary.json`
- 为 demo runner 补充单元测试
- 更新 `README.md`，增加 30 秒试跑说明

## 为什么要做

当前仓库已经有 `generate` 和 `inspect`，但对第一次接触项目的人来说，仍然需要理解参数、fixture 路径和输出链路，才能真正跑通一次演示。

这次补一个 repo 内小 demo 入口，是为了把“工程原型可运行”进一步推进到“新协作者 30 秒内可看到结果”的阶段。

## 影响范围

- `fablemap/demo.py`
- `fablemap/demo_assets/overpass_demo.json`
- `tests/test_demo.py`
- `README.md`
- `docs/claims/2026-03-11-demo-runner-v1.md`

## 明确没有改什么

- 没有修改 `generate` / `inspect` 的既有参数协议
- 没有修改 `world_builder` 的核心生成逻辑
- 没有引入第三方依赖
- 没有实现 Godot 加载器或图形界面
- 没有改动世界 Schema 结构

## 是否涉及协议 / Schema / 命名变更

- 不涉及世界 Schema 结构变更
- 不涉及既有 `generate` / `inspect` 协议变更
- 新增的是 repo 内 demo 辅助入口，不替代现有主 CLI

## 验证方式

- 运行 `python -m unittest tests/test_demo.py tests/test_cli.py`
- 运行 `python -m fablemap.demo --output-dir <temp>` smoke test
- 检查 `world.json` 与 `summary.json` 是否生成
- 执行 `git diff --check`

## 风险点

- demo fixture 需要随着核心生成逻辑演进保持可消费
- demo 输出当前仍是 JSON 级演示，不代表 Godot 端展示已完成
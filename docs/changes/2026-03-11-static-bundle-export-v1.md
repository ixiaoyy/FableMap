# 2026-03-11 静态 bundle 导出入口第一版说明

## 本次做了什么

- 新增 `fablemap/bundle.py`，提供一个从 `world.json` 导出静态 bundle 的入口
- bundle 会输出固定目录结构下的：
  - `world.json`
  - `summary.json`
  - `showcase.json`
  - `showcase.md`
  - `manifest.json`
- `manifest.json` 提供一个更接近 Godot 侧消费的固定读取入口
- 新增 `tests/test_bundle.py`
- 更新 `README.md`，补充 bundle 用法说明

## 为什么要做

当前仓库已经能产出 demo 结果、展示结果，但这些输出仍然偏向“开发过程中的单个文件”，还没有被整理成一个固定结构的静态包。

这次补一个 bundle 导出入口，是为了让现有最小 demo 更接近下游消费形态，为 Godot 或其他展示层提供一个更稳定的目录结构与 manifest 起点。

## 影响范围

- `fablemap/bundle.py`
- `tests/test_bundle.py`
- `README.md`
- `docs/claims/2026-03-11-static-bundle-export-v1.md`

## 明确没有改什么

- 没有修改 `generate` / `inspect` / `demo` / `showcase` 的既有参数协议
- 没有修改 `world_builder` 的核心生成逻辑
- 没有引入第三方依赖
- 没有修改世界 Schema 结构
- 没有实现 Godot 加载器或图形界面

## 是否涉及协议 / Schema / 命名变更

- 不涉及世界 Schema 结构变更
- 不涉及现有主 CLI 协议变更
- 新增的是 repo 内独立静态导出入口，用于生成更稳定的消费包结构

## 验证方式

- 运行 `python -m unittest tests/test_bundle.py tests/test_showcase.py tests/test_demo.py tests/test_cli.py`
- 运行 `python -m fablemap.demo --output-dir <temp>`
- 运行 `python -m fablemap.bundle --input <temp>/world.json`
- 检查 `manifest.json` 与 bundle 文件是否生成
- 执行 `git diff --check`

## 风险点

- bundle manifest 需要持续与现有 summary / showcase 输出保持一致，避免形成第三套漂移定义
- 当前 bundle 仍是 repo 内静态包装层，不代表 Godot 端运行时读取协议已经最终确定
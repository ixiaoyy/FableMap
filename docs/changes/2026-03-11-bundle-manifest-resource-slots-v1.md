# 2026-03-11 bundle manifest 资源槽位增强第一版说明

## 本次做了什么

- 增强 `fablemap/bundle.py` 生成的 `manifest.json`
- 在保留原有 `files` 与 `entrypoints` 的前提下，新增：
  - `slots`
  - `resources`
- `slots` 提供稳定资源槽位命名
- `resources` 提供可遍历的资源清单
- 更新 `tests/test_bundle.py`
- 更新 `README.md`，补充 manifest 结构说明

## 为什么要做

当前 static bundle 已经能输出固定目录结构，但对于 Godot 或其他下游消费层来说，只知道几个文件名还不够稳定。下游通常既需要：

- 一套固定槽位，方便直接读取关键资源
- 一份统一资源清单，方便遍历、注册和加载

这次增强的目标，就是在不改变既有 CLI 协议的前提下，让 `manifest.json` 更像消费接口，而不只是文件列表。

## 影响范围

- `fablemap/bundle.py`
- `tests/test_bundle.py`
- `README.md`
- `docs/claims/2026-03-11-bundle-manifest-resource-slots-v1.md`

## 明确没有改什么

- 没有修改 `generate` / `inspect` / `demo` / `showcase` / `bundle` 的既有参数协议
- 没有修改 `world_builder` 的核心生成逻辑
- 没有引入第三方依赖
- 没有修改世界 Schema 结构
- 没有实现 Godot 加载器或运行时图形界面

## 是否涉及协议 / Schema / 命名变更

- 不涉及世界 Schema 结构变更
- 不涉及既有主 CLI 参数协议变更
- 新增的是 bundle manifest 的消费层字段增强
- manifest `bundle_version` 从 `0.1` 提升到 `0.2`

## 验证方式

- 运行 `python -m unittest tests/test_bundle.py tests/test_showcase.py tests/test_demo.py tests/test_cli.py`
- 运行 `python -m fablemap.demo --output-dir <temp>`
- 运行 `python -m fablemap.bundle --input <temp>/world.json`
- 检查 `manifest.json` 中 `slots` 与 `resources` 是否生成
- 执行 `git diff --check`

## 风险点

- manifest 字段增强需要继续保持命名稳定，避免后续形成平行字段体系
- 当前 `slots` / `resources` 仍是 repo 内迭代中的消费接口，尚不代表 Godot 最终运行时协议已经完全定稿
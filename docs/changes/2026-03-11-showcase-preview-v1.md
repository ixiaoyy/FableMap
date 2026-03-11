# 2026-03-11 showcase / preview 小入口第一版说明

## 本次做了什么

- 新增 `fablemap/showcase.py`，提供一个从 `world.json` 生成展示样品的入口
- showcase 运行后会输出 `showcase.json` 与 `showcase.md`
- `showcase.json` 提供机器可读的展示摘要
- `showcase.md` 提供更适合阅读、分享和演示的展示卡片
- 新增 `tests/test_showcase.py`
- 更新 `README.md`，补充 showcase 用法说明

## 为什么要做

当前仓库已经能生成 `world.json`、输出 `summary.json`，但对外展示时仍然更像“工程产物”，不够像一个可直接阅读和分享的 demo 样品。

这次补一个独立 showcase 入口，是为了让当前最小 demo 更容易被展示、检查、分享，也为后续 Godot 消费层准备更清晰的中间输出。

## 影响范围

- `fablemap/showcase.py`
- `tests/test_showcase.py`
- `README.md`
- `docs/claims/2026-03-11-showcase-preview-v1.md`

## 明确没有改什么

- 没有修改 `generate` / `inspect` / `demo` 的既有参数协议
- 没有修改 `world_builder` 的核心生成逻辑
- 没有引入第三方依赖
- 没有修改世界 Schema 结构
- 没有实现 Godot 加载器或图形界面

## 是否涉及协议 / Schema / 命名变更

- 不涉及世界 Schema 结构变更
- 不涉及现有主 CLI 协议变更
- 新增的是 repo 内独立 showcase 入口，用于展示包装层输出

## 验证方式

- 运行 `python -m unittest tests/test_showcase.py tests/test_demo.py tests/test_cli.py`
- 运行 `python -m fablemap.demo --output-dir <temp>`
- 运行 `python -m fablemap.showcase --input <temp>/world.json`
- 检查 `showcase.json` 与 `showcase.md` 是否生成
- 执行 `git diff --check`

## 风险点

- showcase 输出需要持续复用现有 world 字段，避免形成第二套互相漂移的数据定义
- 当前 showcase 仍是 repo 内演示包装层，不代表 Godot 端展示协议已经完成
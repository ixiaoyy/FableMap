# 模块认领说明

- 模块名 / 区域名：repo 内静态 bundle 导出入口第一版
- 负责人：Augment Agent
- 改动类型：功能
- 当前状态：complete

## 目标

为当前已经具备 `demo` 与 `showcase` 输出能力的仓库，补一个更接近 Godot 消费方向的静态导出入口，把世界文件与展示文件收敛为一套固定目录结构，并提供一个可读取的 `manifest.json`。

本次重点解决：

- 如何把当前离散的 `world.json`、`summary.json`、`showcase.json`、`showcase.md` 收敛成固定 bundle 结构
- 如何在不修改既有 `generate` / `inspect` / `demo` / `showcase` 协议的前提下，新增一个独立导出入口
- 如何为后续 Godot 侧提供更稳定的读取起点

## 计划修改范围

- 新增 `fablemap/bundle.py`
- 新增对应单元测试
- 更新 `README.md`
- 新增本次变更说明文档

## 明确不改范围

- 不修改 `generate` / `inspect` / `demo` / `showcase` 的既有参数协议
- 不修改 `world_builder` 的核心生成逻辑
- 不引入第三方依赖
- 不实现 Godot 加载器或图形界面
- 不修改世界 Schema 结构

## 依据的协议文档

- `README.md`
- `CONTRIBUTING.md`
- `docs/AI参与开发协议.md`
- `docs/WORLD_SCHEMA.md`
- `docs/CLI_SPEC.md`

## 预期产出

- 一个可通过 `python -m fablemap.bundle --input <world.json>` 运行的 bundle 导出入口
- 一份固定目录结构的静态输出目录
- 一份 `manifest.json`
- 对应单元测试
- 一份本次 commit 的变更说明文档

## 验证方式

- 运行 `python -m unittest tests/test_bundle.py tests/test_showcase.py tests/test_demo.py tests/test_cli.py`
- 运行 `python -m fablemap.demo --output-dir <temp>`
- 运行 `python -m fablemap.bundle --input <temp>/world.json`
- 检查 `manifest.json` 与 bundle 文件是否生成
- 执行 `git diff --check`

## 风险与备注

- bundle 输出属于 repo 内静态导出包装层，不替代主世界数据文件
- manifest 需要尽量复用现有 world / summary / showcase 信息，避免形成新的漂移语义层
- 当前目标是为 Godot 消费链路预留稳定入口，不是直接实现 Godot 加载代码
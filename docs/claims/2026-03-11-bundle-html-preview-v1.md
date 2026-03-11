# 模块认领说明

- 模块名 / 区域名：repo 内静态 bundle HTML 预览第一版
- 负责人：Augment Agent
- 改动类型：功能
- 当前状态：complete

## 目标

在已经具备 demo、showcase 与 static bundle 导出能力的基础上，继续补一个最小可体验层，让协作者无需先写 Godot 加载器，也能直接打开 bundle 内的静态页面查看当前世界样品。

本次重点解决：

- 如何让现有 bundle 导出物具备“打开即可看”的最小体验入口
- 如何复用现有 `world.json`、`showcase.json`、`manifest.json` 信息，避免生成第二套独立数据
- 如何在不改现有 CLI 协议的前提下，让 bundle 更接近可演示样品

## 计划修改范围

- 更新 `fablemap/bundle.py`
- 更新 `tests/test_bundle.py`
- 更新 `README.md`
- 新增本次变更说明文档

## 明确不改范围

- 不修改 `generate` / `inspect` / `demo` / `showcase` / `bundle` 的既有参数协议
- 不修改 `world_builder` 的核心生成逻辑
- 不引入第三方依赖
- 不实现 Godot 加载器或图形界面工程
- 不修改世界 Schema 结构

## 依据的协议文档

- `README.md`
- `CONTRIBUTING.md`
- `docs/AI参与开发协议.md`
- `docs/WORLD_SCHEMA.md`
- `docs/CLI_SPEC.md`

## 预期产出

- bundle 目录下新增 `index.html`
- `manifest.json` 中加入 HTML 预览页入口
- 对应单元测试
- README 中的本地体验说明更新
- 一份本次 commit 的变更说明文档

## 验证方式

- 运行 `python -m unittest tests/test_bundle.py tests/test_showcase.py tests/test_demo.py tests/test_cli.py`
- 运行 `python -m fablemap.demo --output-dir <temp>`
- 运行 `python -m fablemap.bundle --input <temp>/world.json`
- 检查 `index.html` 与 manifest 预览入口是否生成
- 执行 `git diff --check`

## 风险与备注

- HTML 预览页属于 repo 内静态体验层，不代表最终 Godot 运行时形态
- 预览页应尽量复用现有 bundle 数据，避免出现新的语义漂移层
- 当前目标是“可快速体验”，不是一次性做成完整交互产品
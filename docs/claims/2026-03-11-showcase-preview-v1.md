# 模块认领说明

- 模块名 / 区域名：repo 内 showcase / preview 小入口第一版
- 负责人：Augment Agent
- 改动类型：功能
- 当前状态：complete

## 目标

为当前已经可运行的 demo/world 输出补一个更适合展示的 repo 内入口，让协作者在生成 `world.json` 之后，可以进一步得到一份可读的展示卡片，而不必手动从原始 JSON 中整理重点信息。

本次重点解决：

- 如何把现有 `world.json` 转为更适合演示的展示内容
- 如何在不修改既有 `generate` / `inspect` / `demo` 主协议的前提下，补一个独立 showcase 入口
- 如何同时保留机器可读输出与人类可读输出

## 计划修改范围

- 新增 `fablemap/showcase.py`
- 新增对应单元测试
- 更新 `README.md`
- 新增本次变更说明文档

## 明确不改范围

- 不修改 `generate` / `inspect` / `demo` 的既有参数协议
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

- 一个可通过 `python -m fablemap.showcase --input <world.json>` 运行的 showcase 入口
- 一份机器可读的 `showcase.json`
- 一份人类可读的 `showcase.md`
- 对应单元测试
- 一份本次 commit 的变更说明文档

## 验证方式

- 运行 `python -m unittest tests/test_showcase.py tests/test_demo.py tests/test_cli.py`
- 运行 `python -m fablemap.demo --output-dir <temp>`
- 运行 `python -m fablemap.showcase --input <temp>/world.json`
- 检查 `showcase.json` 与 `showcase.md` 是否生成
- 执行 `git diff --check`

## 风险与备注

- showcase 输出属于演示包装层，不替代现有世界数据主文件
- 展示内容需要尽量复用现有 world 字段，避免引入第二套相互冲突的语义来源
- 当前目标是“更适合展示”，不是一次性做成 Godot 最终消费协议
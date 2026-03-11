# 模块认领说明

- 模块名 / 区域名：repo 内静态 bundle manifest 资源槽位增强第一版
- 负责人：Augment Agent
- 改动类型：功能
- 当前状态：complete

## 目标

在已经具备静态 bundle 导出能力的前提下，继续把 `manifest.json` 往更稳定的下游消费接口推进。当前 manifest 已经包含基础文件路径与展示信号，但对于 Godot 或其他消费层来说，还缺少一套更明确的“资源槽位”和“可遍历资源清单”。

本次重点解决：

- 如何为 bundle 提供更稳定的资源槽位命名，减少下游硬编码猜测
- 如何让下游既能按固定槽位读取，也能遍历完整资源清单
- 如何在不修改既有 CLI 协议的前提下，增强 bundle manifest 的消费友好性

## 计划修改范围

- 更新 `fablemap/bundle.py`
- 更新 `tests/test_bundle.py`
- 更新 `README.md`
- 新增本次变更说明文档

## 明确不改范围

- 不修改 `generate` / `inspect` / `demo` / `showcase` / `bundle` 的既有参数协议
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

- 更明确的 `manifest.json` 资源槽位结构
- 一份可遍历的资源清单
- 对应单元测试
- README 中的 manifest 说明更新
- 一份本次 commit 的变更说明文档

## 验证方式

- 运行 `python -m unittest tests/test_bundle.py tests/test_showcase.py tests/test_demo.py tests/test_cli.py`
- 运行 `python -m fablemap.demo --output-dir <temp>`
- 运行 `python -m fablemap.bundle --input <temp>/world.json`
- 检查 `manifest.json` 中资源槽位与资源清单是否生成
- 执行 `git diff --check`

## 风险与备注

- manifest 增强需要尽量保持向后兼容，避免破坏已有 bundle 基础结构
- 当前目标是增强 repo 内静态 bundle 的消费接口，不是一次性定死 Godot 最终运行时协议
- 资源槽位命名应尽量简洁稳定，避免后续出现第二套并行命名
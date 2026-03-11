# 模块认领说明

- 模块名 / 区域名：repo 内最小 demo runner 第一版
- 负责人：Augment Agent
- 改动类型：功能
- 当前状态：complete

## 目标

为仓库补一个可复现、可本地快速运行的小 demo 入口，让新协作者不必先理解完整 CLI 链路，也能在最短路径内生成一个稳定的示例世界并看到摘要输出。

本次重点解决：

- 如何把当前“能生成 / 能 inspect”的原型组织成更容易演示的入口
- 如何在不修改既有 `generate` / `inspect` 协议的前提下，提供一条更适合 demo 的运行路径
- 如何保证 demo 结果稳定、可测试、可在仓库内长期复现

## 计划修改范围

- 新增 `fablemap/demo.py`
- 新增 repo 内 demo fixture 资产
- 新增对应测试文件
- 更新 `README.md`
- 新增本次提交对应的 `docs/changes/...` 说明文档

## 明确不改范围

- 不修改 `generate` / `inspect` 的既有参数协议
- 不修改 `world_builder` 的核心生成语义
- 不引入第三方依赖
- 不实现 Godot 侧加载器
- 不实现图形界面或 Web 前端

## 依据的协议文档

- `README.md`
- `CONTRIBUTING.md`
- `docs/AI参与开发协议.md`
- `docs/WORLD_SCHEMA.md`
- `docs/CLI_SPEC.md`

## 预期产出

- 一个可通过 `python -m fablemap.demo` 运行的最小 demo 入口
- 一份稳定的 demo fixture 资产
- 一份 demo runner 测试
- README 中的 demo 试跑说明
- 一份本次 commit 的变更说明文档

## 验证方式

- 运行 `python -m unittest tests/test_demo.py tests/test_cli.py`
- 运行 `python -m fablemap.demo --output-dir <temp>` smoke test
- 检查 demo 输出的 `world.json` 与 `summary.json` 是否生成
- 执行 `git diff --check`

## 风险与备注

- 本次 demo 入口属于演示辅助能力，不作为当前主 CLI 协议替代物
- demo fixture 必须与当前 `world_builder` 能稳定消费的最小结构保持一致
- 输出内容要尽量复用现有摘要逻辑，避免出现两套不一致的 summary 口径
# 模块认领说明

- 模块名 / 区域名：D3 · 玩家参与感与城市神话共创主线文档化收束
- 负责人：Codex
- 改动类型：协议 / 功能 / 文档 / 测试
- 当前状态：in_progress

## 目标

本次准备把 README 中“玩家不是游客，而是共创者”“城市会记住发生过什么”等方向，与当前已实现的浏览器 2D 主舞台能力做一次收束，补齐一个可运行的最小主线：让 bundle 预览页与 nearby/page 输出中，显式展示玩家可参与的城市神话共创线索、世界记忆沉淀和下一步参与入口。

## 计划修改范围

- 会改 `fablemap/world_builder.py`，补充更清晰的玩家参与/世界记忆字段
- 会改 `fablemap/showcase.py` 与 `fablemap/bundle.py`，把共创主线整理进输出与预览页
- 会改 `README.md`、`docs/AI_SHARED_TASKLIST.md` 与 `docs/changes/` 中的相关说明
- 会补充或更新 `tests/` 下与 bundle / showcase / nearby 相关的测试

## 明确不改范围

- 不实现联网社区、账号系统、服务端同步或 moderation 后端
- 不修改 Overpass 抓取协议与缓存层
- 不实现 Godot 工程或外部运行时接入
- 不直接落地 E1/E2/E3/E4 的完整社区系统

## 依据的协议文档

- `README.md`
- `CONTRIBUTING.md`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/UNIVERSAL_TRANSMUTATION_PROTOCOL.md`
- `docs/DISTURBANCE_INTERFACE_ALIGNMENT.md`
- `docs/LONG_TERM_EXPERIENCE.md`

## 预期产出

- 文档：认领说明、变更说明、README 对齐更新
- 代码：bundle/showcase/world data 中的共创主线补充
- 测试：覆盖新增输出字段与预览页入口文案/结构

## 验证方式

- 执行现有单元测试中受影响的 `bundle / showcase / nearby / demo` 相关测试
- 运行 `python -m fablemap.demo --output-dir demo-output` 与 `python -m fablemap.bundle --input demo-output/world.json`
- 打开生成后的 `bundle/index.html`，确认共创主线内容可见

## 风险与备注

- 需要避免把长期社区/治理路线一次性硬编码成过度具体的运行时协议
- 需要保持 README、共享任务列表与当前实现口径一致，避免“文档说已实现，但代码只是概念文案”

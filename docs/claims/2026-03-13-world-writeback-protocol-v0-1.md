# 模块认领说明

- 模块名 / 区域名：P5 · World Writeback Protocol v0.1 最小写回闭环
- 负责人：Roo / AI 协作者
- 改动类型：功能 / API / 前端 / 测试 / 文档
- 当前状态：in_progress

## 目标

本次准备完成 `P5` 的第一段可运行闭环：

- 为 [`observe`](docs/WORLD_WRITEBACK_PROTOCOL.md:26) / [`dwell`](docs/WORLD_WRITEBACK_PROTOCOL.md:27) / [`mark`](docs/WORLD_WRITEBACK_PROTOCOL.md:28) 三种最小写回行为补一条真实 API 链路
- 让前端可以提交最小事件到后端
- 让后端生成统一事件记录、玩家状态变化、地点痕迹与世界反馈
- 先使用本地文件持久化保存最小写回结果，为后续治理边界与更正式的数据层演进留出接口

## 计划修改范围

- 会改 [`fablemap/web/router.py`](fablemap/web/router.py)
- 会改 [`fablemap/web/service.py`](fablemap/web/service.py)
- 可能新增 [`fablemap/writeback.py`](fablemap/writeback.py)
- 会改 [`frontend/api-client.js`](frontend/api-client.js)
- 会改 [`frontend/app.js`](frontend/app.js)
- 会改 [`frontend/src/App.jsx`](frontend/src/App.jsx)
- 会改 [`tests/test_api.py`](tests/test_api.py)
- 视实现需要补充相关说明文档

## 明确不改范围

- 不改 [`docs/WORLD_WRITEBACK_PROTOCOL.md`](docs/WORLD_WRITEBACK_PROTOCOL.md) 的核心协议定义与字段语义
- 不改 [`P3`](docs/AI_SHARED_TASKLIST.md:39) 对应的治理边界裁定
- 不改 [`P4`](docs/AI_SHARED_TASKLIST.md:40) 的历史深度 / Time Folds 扩展
- 不引入数据库、不推进多端同步、不扩展完整社区共创机制
- 不重写现有 nearby 生成主链与 bundle 导出结构

## 依据的协议文档

- [`README.md`](README.md)
- [`CONTRIBUTING.md`](CONTRIBUTING.md)
- [`docs/AI_SHARED_TASKLIST.md`](docs/AI_SHARED_TASKLIST.md)
- [`docs/AI参与开发协议.md`](docs/AI参与开发协议.md)
- [`docs/WORLD_WRITEBACK_PROTOCOL.md`](docs/WORLD_WRITEBACK_PROTOCOL.md)
- [`docs/WORLD_WRITEBACK_PLAN.md`](docs/WORLD_WRITEBACK_PLAN.md)
- [`docs/PLAYER_STATE.md`](docs/PLAYER_STATE.md)

## 预期产出

- 最小写回处理模块或等效服务层实现
- 一个最小写回接口，例如 `POST /api/world/event`
- 前端可触发的 `observe / dwell / mark` 表单或按钮入口
- 返回结构化的玩家状态、地点状态、世界反馈与持久化结果
- 对应 API 测试与回归验证

## 验证方式

- 运行 [`tests/test_api.py`](tests/test_api.py) 中新增/更新的接口测试
- 验证接口能够正确拒绝非法 `event_type`、非法目标或缺失字段
- 验证成功提交后能返回结构化结果，并在再次读取同一 slice/player 时保留最小痕迹
- 验证前端调用链至少能完成一次成功提交

## 风险与备注

- 当前仓库尚未有正式玩家身份层，本次会采用最小 `player_id` 默认值或显式传值策略
- 当前世界详情接口未统一，第一版 place/slice 状态可能先以轻量文件状态保存并由写回响应直接返回
- 前端现有主入口仍以 nearby 生成页为主，本次会以不破坏原流程为前提叠加写回入口
- 若实现中发现协议字段与现有页面数据结构存在缺口，只补最小映射，不擅自扩写协议范围

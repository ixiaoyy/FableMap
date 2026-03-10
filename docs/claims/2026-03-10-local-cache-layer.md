# 模块认领说明

- 模块名 / 区域名：本地 Overpass 缓存层
- 负责人：Augment Agent
- 改动类型：功能 / 工具 / 测试 / 文档
- 当前状态：complete

## 目标

为 `python -m fablemap generate` 的在线请求模式增加最小本地缓存能力：

- 为同一组坐标与半径生成稳定 cache key
- 命中缓存时直接读取本地 JSON
- 未命中时请求 Overpass 并写回缓存
- 提供 `--cache-dir` 与 `--refresh` 控制项

## 计划修改范围

- 修改 `fablemap/cli.py`
- 修改 `fablemap/overpass.py`
- 新增缓存辅助模块
- 新增缓存相关测试
- 新增本次实现对应的变更说明文档

## 明确不改范围

- 不实现完整 `fablemap cache` 子命令
- 不引入数据库或更复杂的索引层
- 不修改世界 Schema 结构
- 不接入 Godot
- 不引入第三方依赖

## 依据的协议文档

- `README.md`
- `CONTRIBUTING.md`
- `docs/AI参与开发协议.md`
- `docs/CLI_SPEC.md`
- `docs/ENGINEERING_PLAN_V0.1.md`

## 预期产出

- 一个最小可用的本地缓存链路
- CLI 缓存参数
- 覆盖缓存命中 / 写入 / 刷新路径的测试
- 一份本次 commit 说明文档

## 验证方式

- 运行单元测试
- 运行离线 fixture CLI 测试
- 运行带缓存目录的在线/模拟 smoke test

## 风险与备注

- 当前缓存仅保存原始 Overpass JSON，不做 TTL 与清理策略
- 本次优先保证开发期稳定性，不追求完整缓存管理界面
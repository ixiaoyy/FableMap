# 2026-03-10 本地 Overpass 缓存层实现说明

## 本次做了什么

- 新增 `fablemap/cache.py`，提供默认缓存目录、稳定 cache key、缓存路径、JSON 读写能力
- 为 `fablemap/overpass.py` 增加本地缓存读取、写回和 `refresh` 控制
- 为 `fablemap/world_builder.py` 增加缓存相关参数透传
- 为 `fablemap/cli.py` 增加：
  - `--cache-dir`
  - `--refresh`
- CLI 输出摘要中增加缓存状态与缓存目录信息
- 新增 `tests/test_cache.py`，并扩展 `tests/test_overpass.py`、`tests/test_cli.py`

## 为什么要做

当前 CLI 已经具备在线抓取 Overpass 数据的能力，但开发阶段如果反复生成同一坐标区域，会频繁依赖外部网络。增加最小缓存层后，可以在不改变世界 Schema 的前提下提高开发稳定性，并为后续缓存管理命令预留基础。

## 影响范围

- Overpass 在线请求链路
- `generate` 命令参数与输出摘要
- 缓存辅助模块与测试覆盖

## 明确没有改什么

- 没有实现完整 `fablemap cache` 子命令
- 没有引入 TTL、清理策略或复杂索引
- 没有修改世界 Schema
- 没有引入第三方依赖
- 没有接入 Godot

## 是否涉及协议 / Schema / 命名变更

- 不涉及协作协议变更
- 不涉及世界 Schema 结构变更
- 涉及 CLI 参数扩展：新增 `--cache-dir` 与 `--refresh`

## 验证方式

- 运行 `python -m unittest tests/test_cache.py`
- 运行 `python -m unittest tests/test_overpass.py`
- 运行 `python -m unittest tests/test_cli.py`
- 运行 `python -m unittest tests/test_world_builder.py`
- 运行 `python -m unittest discover -s tests`
- 运行 `python -m fablemap generate --help`
- 运行带预置缓存目录的 CLI smoke test，确认命中缓存时无需网络也可生成 `world.json`

## 风险点

- 当前缓存键仅基于 `lat/lon/radius`，尚未加入版本戳或 schema 兼容层
- 当前缓存保存原始 Overpass JSON，若上游响应格式变化，仍需依赖现有校验逻辑兜底
- 当前只提供最小缓存能力，尚未提供清理与查看入口
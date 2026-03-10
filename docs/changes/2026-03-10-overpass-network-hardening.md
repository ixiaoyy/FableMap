# 2026-03-10 Overpass 真实数据接入健壮性增强说明

## 本次做了什么

- 为 `fablemap/overpass.py` 增加 `OverpassError` 异常类型
- 为实时 Overpass 请求增加超时参数、有限重试和更清晰的错误信息
- 为 `generate` CLI 增加：
  - `--request-timeout`
  - `--request-retries`
- 为实时请求失败路径补充测试

## 为什么要做

第一版 CLI 已经能离线跑通，但真实网络请求仍然缺少足够的健壮性。增强后可以让在线请求在失败时更可理解，也更便于后续接缓存或多数据源。

## 影响范围

- Overpass 实时请求链路
- CLI 参数面
- 网络错误提示
- 自动化测试覆盖范围

## 明确没有改什么

- 没有引入缓存持久化层
- 没有改世界 Schema 文档
- 没有引入第三方依赖
- 没有改 Godot 接入

## 是否涉及协议 / Schema / 命名变更

- 不涉及协议变更
- 不涉及 Schema 结构变更
- 涉及 CLI 参数扩展：新增 `--request-timeout` 和 `--request-retries`

## 验证方式

- 运行 `python -m unittest tests/test_overpass.py`
- 运行 `python -m unittest tests/test_cli.py`
- 运行 `python -m unittest tests/test_world_builder.py`
- 尝试真实在线请求 smoke test，确认超时失败时能返回清晰错误信息

## 风险点

- 真实 Overpass 仍受外部网络、限流和服务状态影响
- 当前只做了最小重试，尚未加入缓存、退避策略和多节点切换
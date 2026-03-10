# 2026-03-10 第一版 Python CLI 与 world.json 生成闭环说明

## 本次做了什么

- 新增 `fablemap/` Python 包与 `python -m fablemap` 入口
- 新增 `generate` CLI，支持 `--lat`、`--lon`、`--radius`、`--output`、`--seed`、`--source-file`
- 新增 `fablemap/overpass.py`，提供最小 Overpass 查询构造与请求能力
- 新增 `fablemap/world_builder.py`，把基础地理元素转成最小 `world.json` 结构
- 新增离线测试夹具与测试用例，覆盖 world builder 和 CLI 生成闭环

## 为什么要做

为了让仓库从“只有文档和协议”进入“最小可运行实现”阶段，先打通一个稳定、可验证的本地闭环：

- 输入经纬度
- 读取真实或离线地理源数据
- 生成符合当前 Schema 骨架的世界 JSON

## 影响范围

- Python CLI 入口
- 最小世界构建逻辑
- OSM / Overpass 数据接入边界
- 本地离线测试能力

## 明确没有改什么

- 没有引入数据库、缓存或持久化层
- 没有接入 Godot 渲染或 Loader
- 没有实现完整 H3 网格流程
- 没有修改世界 Schema 文档定义
- 没有新增第三方 Python 依赖

## 是否涉及协议 / Schema / 命名变更

- 不涉及协作协议变更
- 不涉及世界 Schema 文档结构变更
- 新增运行时代码接口：`python -m fablemap generate`

## 验证方式

- 运行 `python -m unittest tests/test_world_builder.py`
- 运行 `python -m unittest tests/test_cli.py`
- 运行 CLI smoke test：
  - `python -m fablemap generate --lat 35.6580 --lon 139.7016 --radius 300 --output <temp> --source-file tests/fixtures/overpass_sample.json`
- 检查输出 JSON 是否包含：`world_id`、`region`、`pois`、`roads`、`landmarks`、`state`

## 风险点

- 当前语义映射仍是最小硬编码规则集，后续需要逐步扩充
- 真实 Overpass 网络请求还没有做重试、限流和缓存处理
- 当前输出重点是结构稳定，不代表最终叙事质量
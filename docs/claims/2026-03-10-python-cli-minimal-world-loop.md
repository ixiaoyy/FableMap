# 模块认领说明

- 模块名 / 区域名：第一版 Python CLI 与最小 world.json 生成闭环
- 负责人：Augment Agent
- 改动类型：功能 / 工具 / 测试 / 文档
- 当前状态：complete

## 目标

建立 FableMap 的第一版可运行开发入口：

- 支持 `python -m fablemap generate`
- 输入 `--lat` / `--lon` / `--radius` / `--output`
- 生成符合当前世界 Schema 骨架的 `world.json`
- 为后续接入真实 OSM/Overpass、缓存层和 Godot Loader 保留扩展点

## 计划修改范围

- 新增 `fablemap/` Python 包
- 新增 CLI 入口与世界构建逻辑
- 新增 `tests/` 下的最小离线测试
- 新增本次代码提交对应的变更说明文档

## 明确不改范围

- 不改 Godot 工程与渲染接入
- 不改世界 Schema 文档结构
- 不引入数据库或缓存持久化层
- 不实现完整 H3 流程
- 不引入外部 Python 依赖安装步骤

## 依据的协议文档

- `README.md`
- `CONTRIBUTING.md`
- `docs/AI参与开发协议.md`
- `docs/CLI_SPEC.md`
- `docs/ENGINEERING_PLAN_V0.1.md`
- `docs/WORLD_SCHEMA.md`

## 预期产出

- 一个可执行的 `generate` CLI
- 一个最小世界构建器
- 一组离线测试夹具与测试用例
- 一份本次实现的 commit 说明文档

## 验证方式

- 运行 Python 单元测试
- 运行一次 CLI smoke test
- 检查输出 JSON 是否包含核心 Schema 字段

## 风险与备注

- 第一版会优先保证可运行和结构稳定，不追求完整语义深度
- 若真实网络请求不可用，测试将通过本地 fixture 保证离线可验证
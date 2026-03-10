# 模块认领说明

- 模块名 / 区域名：Overpass 真实数据接入健壮性增强
- 负责人：Augment Agent
- 改动类型：功能 / 工具 / 测试 / 文档
- 当前状态：complete

## 目标

在当前第一版 `generate` CLI 基础上，增强真实 Overpass 网络请求链路：

- 支持请求超时配置
- 支持有限次数重试
- 在网络失败时返回更清晰的错误信息
- 保持离线 `--source-file` 模式不受影响

## 计划修改范围

- 修改 `fablemap/overpass.py`
- 修改 `fablemap/cli.py`
- 补充 `tests/` 下的最小相关测试
- 新增本次代码提交对应的变更说明文档

## 明确不改范围

- 不改世界 Schema 文档结构
- 不引入缓存持久化层
- 不引入第三方依赖
- 不改 Godot 侧接入
- 不实现多数据源路由

## 依据的协议文档

- `README.md`
- `CONTRIBUTING.md`
- `docs/AI参与开发协议.md`
- `docs/CLI_SPEC.md`
- `docs/ENGINEERING_PLAN_V0.1.md`

## 预期产出

- 更健壮的 Overpass 请求函数
- CLI 超时 / 重试参数
- 网络失败路径测试
- 一份本次增强的 commit 说明文档

## 验证方式

- 运行单元测试
- 运行离线 fixture CLI 测试
- 尝试一次真实 Overpass CLI smoke test

## 风险与备注

- 真实 Overpass 受外部网络与限流影响，验证结果可能受环境波动影响
- 本次优先增强错误处理，不引入复杂缓存或服务降级逻辑
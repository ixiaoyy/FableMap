# 模块认领说明

- 模块名 / 区域名：附近地图异世界体验入口第一版
- 负责人：Augment Agent
- 改动类型：功能
- 当前状态：complete

## 目标

补一个最小体验入口，把“附近真实地图 → 异世界 world → 可打开预览页”串成一条更直接的路径，优先复用现有 `build_world`、`bundle` 与 HTML 预览能力。

## 本次重点

- 新增一个最小 nearby 入口，接收 `lat / lon / radius`
- 生成 `world.json` 后继续导出 `bundle/index.html`
- 让输出结果直接给出预览页路径，尽量减少体验门槛

## 计划修改范围

- 新增 nearby 入口模块
- 适度整理 bundle 导出逻辑，便于复用
- 新增对应测试
- 更新 `README.md`
- 新增本次变更说明文档

## 明确不改范围

- 不修改 `WORLD_SCHEMA` 协议
- 不改动 `world_builder` 的幻想映射规则
- 不引入第三方依赖
- 不实现浏览器端动态地图 UI 或后端服务

## 验证方式

- 新增 nearby 入口单测
- 回归 `bundle / demo / cli` 相关测试
- 进行最小 smoke：生成世界并确认 `bundle/index.html` 可产出
- 执行 `git diff --check`

## 风险与备注

- 第一版优先解决闭环，不等于最终产品化交互体验
- 真实地图在线抓取依赖 Overpass 可用性，因此需要保留 fixture 路径用于稳定测试
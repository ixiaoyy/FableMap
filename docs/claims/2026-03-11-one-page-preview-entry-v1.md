# 模块认领说明

- 模块名 / 区域名：repo 内单页面体验入口第一版
- 负责人：Augment Agent
- 改动类型：功能
- 当前状态：complete

## 目标

在现有 `demo`、`showcase` 与 `bundle/index.html` 都已经可用的基础上，补一个仓库内现成可打开的单页面体验入口，让使用者无需先运行任何命令，也能直接感受当前 FableMap 小 demo 的展示效果。

## 本次重点

- 提供一个直接打开即可查看的页面入口
- 不要求使用者先执行 `python -m fablemap.demo` 或 `python -m fablemap.bundle`
- 保持现有 CLI 与 world schema 不变

## 计划修改范围

- 新增仓库根目录 `index.html`
- 更新 `README.md`
- 新增本次变更说明文档

## 明确不改范围

- 不修改 `generate` / `inspect` / `demo` / `showcase` / `bundle` 参数协议
- 不修改 `world_builder` 核心逻辑
- 不引入第三方依赖
- 不实现浏览器端动态运行时或后端服务

## 验证方式

- 检查根目录 `index.html` 可直接打开阅读
- 执行 `git diff --check`
- 按需运行现有相关单测，确认本次改动未影响原有流程

## 风险与备注

- 该页面属于 repo 内静态样品入口，不是最终产品 UI 定稿
- 页面应明确区分“当前样品页”与“真实生成链路”
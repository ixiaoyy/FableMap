# 2026-03-11 单页面体验入口第一版说明

## 本次做了什么

- 在仓库根目录新增 `index.html`
- 让使用者无需先运行任何命令，也能直接打开一个页面体验当前 demo 样品
- 更新 `README.md`，把“直接打开页面”补充为最短体验路径

## 为什么要做

虽然仓库已经具备 `demo`、`showcase`、`bundle` 与 `bundle/index.html` 预览能力，但对于只想“先体验一下”的人来说，仍然需要先跑命令，门槛偏高。

这次补仓库根目录单页面入口，是为了把体验路径收敛成：

- 打开仓库
- 双击 / 浏览器打开 `index.html`
- 先感受项目当前效果

## 影响范围

- `index.html`
- `README.md`
- `docs/claims/2026-03-11-one-page-preview-entry-v1.md`

## 明确没有改什么

- 没有修改 `generate` / `inspect` / `demo` / `showcase` / `bundle` 的既有参数协议
- 没有修改 `world_builder` 的核心逻辑
- 没有引入第三方依赖
- 没有替代现有生成链路

## 验证方式

- 检查根目录 `index.html` 内容与链接
- 执行 `git diff --check`
- 按需回归现有相关单测，确认原流程未受影响

## 备注

- 该页面是 repo 内静态样品入口，不代表最终产品 UI 已定稿
- 后续仍可继续把它推进为更接近真正交互 demo 的体验页
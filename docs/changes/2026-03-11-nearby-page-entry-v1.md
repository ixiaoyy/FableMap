# 2026-03-11 附近地图真正页面入口第一版说明

## 本次做了什么

- 新增 `fablemap.page` 本地页面服务模块，提供页面入口、健康检查与 nearby 生成 API
- 新增 `python -m fablemap page` 子命令，启动本地页面体验服务
- 把 `fablemap.nearby` 中的生成流程整理为可复用 helper，供 CLI 与页面服务共用
- 把仓库根目录 `index.html` 改成可交互页面壳，可在浏览器里填坐标、选择模式并嵌入预览页
- 更新 `README.md`，把页面启动方式写成新的最短体验路径
- 新增页面服务与 CLI 接入测试，并补充页面输出目录忽略规则

## 为什么要做

上一版已经实现了：

- `python -m fablemap nearby ...`
- 自动生成 `world.json`
- 自动导出 `bundle/index.html`

但触发入口仍然是命令行。

这次的目标是继续把体验路径收敛为：

- 启动本地页面服务
- 在浏览器里输入附近坐标
- 直接触发生成
- 在同一个页面里看到新的预览结果

## 影响范围

- `.gitignore`
- `index.html`
- `fablemap/cli.py`
- `fablemap/nearby.py`
- `fablemap/page.py`
- `tests/test_cli.py`
- `tests/test_page.py`
- `README.md`
- `docs/claims/2026-03-11-nearby-page-entry-v1.md`

## 明确没有改什么

- 没有修改 `WORLD_SCHEMA` 协议
- 没有重写 `world_builder` 的幻想映射规则
- 没有引入第三方依赖或 Web 框架
- 没有实现浏览器端动态底图或复杂选点 UI

## 验证方式

- 执行 `tests/test_page.py`
- 回归 `tests/test_nearby.py`、`tests/test_cli.py`、`tests/test_bundle.py`、`tests/test_demo.py`、`tests/test_showcase.py`
- 执行本地页面服务 smoke，确认 `/api/health`、`/api/nearby` 与生成后的 `/generated/.../bundle/index.html` 可用
- 执行 `git diff --check`

## 备注

- 浏览器页面已经成为 nearby 的真正入口，但第一版仍然依赖本地 Python 服务进程承接请求
- 页面同时保留 `fixture` 与 `live` 两种模式，方便离线稳定验证和在线真实体验
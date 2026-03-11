# 2026-03-11 bundle HTML 预览第一版说明

## 本次做了什么

- 增强 `fablemap/bundle.py`
- bundle 目录下新增 `index.html`
- `index.html` 会复用现有 `showcase`、`summary` 与 `manifest` 信息，生成一个可直接本地打开的静态预览页
- `manifest.json` 同步加入 HTML 预览页文件、入口与资源槽位信息
- 更新 `tests/test_bundle.py`
- 更新 `README.md`，补充本地体验说明

## 为什么要做

当前仓库已经能稳定生成 world、showcase 与 bundle，但这些产物主要还是开发友好的 JSON/Markdown 文件。用户虽然已经可以看结果，但离“打开就能感受一下”还差一个直接入口。

这次补 `index.html`，是为了让当前最小 demo 进入一个更容易体验的阶段：

- 先生成 bundle
- 再直接打开静态 HTML 页面
- 不需要等待 Godot 侧代码先落地

## 影响范围

- `fablemap/bundle.py`
- `tests/test_bundle.py`
- `README.md`
- `docs/claims/2026-03-11-bundle-html-preview-v1.md`

## 明确没有改什么

- 没有修改 `generate` / `inspect` / `demo` / `showcase` / `bundle` 的既有参数协议
- 没有修改 `world_builder` 的核心生成逻辑
- 没有引入第三方依赖
- 没有修改世界 Schema 结构
- 没有实现 Godot 运行时代码

## 是否涉及协议 / Schema / 命名变更

- 不涉及世界 Schema 结构变更
- 不涉及既有主 CLI 参数协议变更
- bundle `manifest.json` 增加了 HTML 预览页相关字段
- manifest `bundle_version` 从 `0.2` 提升到 `0.3`

## 验证方式

- 运行 `python -m unittest tests/test_bundle.py tests/test_showcase.py tests/test_demo.py tests/test_cli.py`
- 运行 `python -m fablemap.demo --output-dir <temp>`
- 运行 `python -m fablemap.bundle --input <temp>/world.json`
- 检查 `index.html` 与 manifest 预览入口是否生成
- 执行 `git diff --check`

## 风险点

- 当前 HTML 预览页是 repo 内静态体验层，不代表最终产品展示层已经定稿
- 预览页需要持续复用现有 bundle 数据，避免出现另一套独立展示语义
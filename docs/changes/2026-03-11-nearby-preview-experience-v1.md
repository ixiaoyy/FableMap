# 2026-03-11 附近地图异世界体验入口第一版说明

## 本次做了什么

- 新增 `fablemap.nearby` 模块，支持输入 `lat / lon / radius`
- 新增 `python -m fablemap nearby ...` 子命令，把附近地图生成与 bundle 预览串成一个入口
- 复用并整理 `bundle` 导出逻辑，抽出可复用的 `export_bundle(...)`
- 更新 `README.md`，补充附近地图异世界第一版体验方式
- 新增对应单元测试，覆盖 nearby runner 与 CLI 子命令

## 为什么要做

仓库之前已经具备：

- 世界生成
- showcase 组织
- bundle 导出
- HTML 预览页

但“附近真实地图 → 异世界预览”还需要用户手动把这些步骤串起来。

这次的目标是先补一个最小闭环，让体验路径收敛为：

- 输入附近坐标
- 生成 `world.json`
- 自动导出 `bundle/index.html`
- 直接拿到可打开的预览页路径

## 影响范围

- `fablemap/bundle.py`
- `fablemap/cli.py`
- `fablemap/nearby.py`
- `tests/test_cli.py`
- `tests/test_nearby.py`
- `README.md`
- `docs/claims/2026-03-11-nearby-preview-experience-v1.md`

## 明确没有改什么

- 没有修改 `WORLD_SCHEMA` 协议
- 没有修改 `world_builder` 的映射规则
- 没有引入第三方依赖
- 没有实现浏览器端动态地图 UI 或服务端能力

## 验证方式

- 执行 nearby 相关单测
- 回归 `bundle / demo / cli` 相关单测
- 执行 fixture 驱动的 nearby smoke，确认 `world.json` 与 `bundle/index.html` 可生成
- 执行 `git diff --check`

## 备注

- 这一版优先解决“附近地图 → 异世界 → 预览页”的最小闭环
- 在线模式仍依赖 Overpass 服务可用性，因此保留 `--source-file` 以支持稳定离线验证
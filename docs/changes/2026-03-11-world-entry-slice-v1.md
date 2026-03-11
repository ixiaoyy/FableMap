# 2026-03-11 world entry slice v1

## 背景

项目方向已经明确为“完整世界”，而不是仅仅优化 demo 外壳。因此本次改动聚焦于把 nearby / bundle 输出组织成更像世界切片观察窗的结构。

## 本次改动

- 在 `fablemap.showcase` 中把既有世界字段整理为更清晰的世界入口结构
- 在 `fablemap.bundle` 预览页中补充现实骨架、世界状态、持续线索与可玩钩子面板
- 更新 `tests/test_showcase.py` 与 `tests/test_bundle.py`
- 更新 `README.md` 中对 bundle / nearby / 预览页的定位说明

## 边界说明

- 不修改 `WORLD_SCHEMA`
- 不修改 `world_builder` 输出字段
- 不引入第三方依赖
- `manifest.json` 版本保持 `0.3`，本次只增强展示组织，不引入新的 bundle 协议版本

## 验证

- `python -m unittest tests/test_showcase.py tests/test_bundle.py`
- `python -m unittest tests/test_page.py tests/test_nearby.py tests/test_cli.py tests/test_bundle.py tests/test_demo.py tests/test_showcase.py`
- `git diff --check`
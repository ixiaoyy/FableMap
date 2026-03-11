# 模块认领说明

- 模块名 / 区域名：world entry slice v1（世界切片观察窗增强）
- 负责人：Augment Agent
- 改动类型：功能
- 当前状态：done

## 目标

把当前 nearby / bundle 的输出从“demo 结果展示”推进为“完整世界的切片观察窗”，让页面与静态预览更明确地呈现现实骨架、世界状态、持续线索与可玩钩子。

## 计划修改范围

- `fablemap/showcase.py`
- `fablemap/bundle.py`
- `tests/test_showcase.py`
- `tests/test_bundle.py`
- `README.md`
- `docs/changes/2026-03-11-world-entry-slice-v1.md`

## 明确不改范围

- 不修改 `docs/WORLD_SCHEMA.md`
- 不修改 `fablemap/world_builder.py` 的字段结构
- 不引入第三方依赖或前端框架
- 不在本次实现持久化存档、跨区域联动模拟或新的协议字段

## 依据的协议文档

- `README.md`
- `CONTRIBUTING.md`
- `docs/AI参与开发协议.md`
- `docs/WORLD_SCHEMA.md`
- `docs/ARCHITECTURE.md`
- `docs/claims/README.md`

## 预期产出

- 更厚的 showcase JSON / Markdown 组织结构
- 更像世界观察窗的 bundle 预览页
- 对应测试与 README 说明更新
- 本次变更说明文档

## 验证方式

- `python -m unittest tests/test_showcase.py tests/test_bundle.py`
- `python -m unittest tests/test_page.py tests/test_nearby.py tests/test_cli.py tests/test_bundle.py tests/test_demo.py tests/test_showcase.py`
- `git diff --check`

## 风险与备注

- 本次只能复用既有 world 数据字段，不能把缺失的世界模拟能力伪装成已实现
- 新展示结构应保持 bundle / showcase 的既有输出兼容，优先做加法而非破坏式替换
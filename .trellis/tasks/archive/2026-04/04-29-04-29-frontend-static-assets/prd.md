# Frontend Static Asset Organization

## Goal
全面整理前端与静态资源目录，使运行资源按“可访问性 / 分类 / 角色或功能”组织，审计材料按日期任务归档；本轮直接迁移现有默认 NPC 平铺资源到按角色目录，并同步后端 seed、测试、前端导入、资源规范文档。

## Requirements
- Public URL 运行资源统一放在 `frontend/public/assets/<domain>/...`。
- 默认公益 NPC 资源从 `frontend/public/assets/npcs/<char_id>-<expression>.png` 迁移到 `frontend/public/assets/npcs/public-welfare/<char_id>/<expression>.png`。
- `mimi-nya-*` 也纳入对应角色目录：`public-welfare/char_pw_mimi_nya/`。
- App import 资源目录使用功能分类：
  - `frontend/app/assets/discover-reference/` -> `frontend/app/assets/discover/reference/`
  - `frontend/app/assets/homepage-reference/` -> `frontend/app/assets/homepage/reference/`
- Public map snapshots 纳入 assets 分类：`frontend/public/map-snapshots/` -> `frontend/public/assets/map-snapshots/`，并同步 backend/frontend URL。
- 保持 Tavern schema/API 字段不变；只改变默认 seed 中的资源 URL 值。
- 不移动、删除或重命名既有 `docs/` 文档；只允许更新资源规范内容或新增资源目录 README。
- 不处理 `.codex/generated_images` 缓存；若提及，只作为草稿/来源缓存。

## Acceptance Criteria
- [x] 25 个默认公益 NPC 均引用嵌套角色目录下的 public URL。
- [x] 125 个 NPC PNG 均位于 `frontend/public/assets/npcs/public-welfare/<char_id>/<expression>.png`。
- [x] 旧的 `frontend/public/assets/npcs/*.png` 平铺 NPC 文件不再存在。
- [x] `default_public_welfare_taverns()` 生成的所有 `/assets/npcs/...` 引用均能在 `frontend/public/` 下找到有效 PNG。
- [x] 发现页/首页/布局 showcase 的 import 图片路径同步到新功能分类目录。
- [x] 地图快照生成与读取统一到 `/assets/map-snapshots/...`。
- [x] 资源规范文档说明新 canonical 目录。
- [x] Focused pytest、frontend scripts/build 通过。

## Technical Notes
- Cross-layer flow: `default_taverns.py` seed URL -> tests verify `frontend/public` file -> frontend runtime serves `/assets/...`.
- Do not add dependencies.
- Preserve owner/imported NPC art precedence and SillyTavern-compatible character payload shape.

## Implementation Plan
See `docs/superpowers/plans/2026-04-29-frontend-static-asset-organization.md`.

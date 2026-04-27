# 多地点类型发现筛选 MVP

## Goal

在不修改后端 Schema、不引入 `Place/Home/Member/Relationship` 持久模型的前提下，让发现页先具备“地点类型”表达与筛选能力：酒馆仍是默认兼容类型，但用户能看到咖啡店、奶茶店、餐馆、便利店、书店、学校等真实生活地点语义。

## Requirements

- 新增前端纯函数，根据现有公开 Tavern payload（名称、简介、地址、NPC tags）推断有限地点类型。
- 支持有限枚举：`tavern`、`cafe`、`milk-tea-shop`、`restaurant`、`convenience-store`、`bookstore`、`school`、`home`。
- `home` 作为保留类型：可被识别，但不进入发现页公开筛选 chips，避免把 Home 当成开放社交入口。
- 发现页增加“地点类型”筛选 chips，并在卡片上展示地点类型徽章。
- Tavern 预览弹窗展示地点类型徽章，帮助用户理解“酒馆是地点类型之一”。
- 不改变任何创建/更新 payload，不向后端保存新字段。
- 不实现 Home、家庭成员、学校成员同步或关系图。

## Acceptance Criteria

- [ ] 纯函数测试覆盖关键词推断、默认回退、保留 Home 不公开发现。
- [ ] 发现页可按地点类型筛选列表。
- [ ] 发现页卡片和预览弹窗展示地点类型徽章。
- [ ] 未识别地点仍显示为默认“酒馆”。
- [ ] `npm --prefix .\frontend test` 通过。
- [ ] `npm --prefix .\frontend run build` 通过或如实记录既有阻塞。

## Technical Notes

- 类型推断只读现有字段，不修改 `docs/WORLD_SCHEMA.md`。
- 使用 `frontend/app/lib/` 放置 route 可复用 helper。
- 脚本测试放入 `frontend/scripts/` 并接入 `frontend/package.json`。
- 本任务是 `04-27-place-type-home-concept` 的后续实现切片。

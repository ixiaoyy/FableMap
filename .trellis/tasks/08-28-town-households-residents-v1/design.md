# Town 家庭与居民 v1：技术设计

## Data flow

```text
House TMJ NpcSpawns
  → decodeTiledRegion
  → WorldCatalog stable NPC index / collision feet
  → WorldScene existing renderNpcs
  → EntityFactory existing NpcEntity
  → existing DialoguePanel
```

本批不新增运行时机制，只扩充现有固定 NPC 数据。五张住宅 TMJ 是位置 owner，dialogue definitions 是文本 owner，visual profile 是 frame owner。

## Resident contract

| Region | Entity ID | NPC ID | Dialogue ID |
|---|---|---|---|
| town-house-west | `town-house-west-resident` | `town-resident-mozi` | `resident-mozi-home` |
| town-house-north | `town-house-north-resident` | `town-resident-haonan` | `resident-haonan-home` |
| town-house | `town-house-riverside-resident` | `town-resident-alan` | `resident-alan-home` |
| town-house-southwest | `town-house-southwest-resident` | `town-resident-haomeili` | `resident-haomeili-home` |
| town-house-east | `town-house-east-resident` | `town-resident-xiangzi` | `resident-xiangzi-home` |

上述姓名与 ID 已由用户确认。所有 interactionType 固定为 `dialogue`，NpcEntity 与 WorldScene 不增加居民特例。

## Appearance

五名居民从已登记 `generic_people.png` 选取互不重复且不与华强、昊天、阿禾重复的 16×32 frame。frame key 只加入 `VECTORAITH_NPC_FRAMES`，不进入 TMJ、domain 或 save。

## Relationships

- 阿澜与阿禾是姐妹，住河畔民宅；阿禾继续在粉花树附近，阿澜固定在家中。
- 昊美丽与昊天是兄妹，住铁匠巷民宅；昊天继续在工坊外，昊美丽固定在家中。
- 墨子、浩南、祥子通过对话与道路、山麓和湖岸产生地点关系，不增加 gameplay service。

## Compatibility

- 新 NPC 只改变 WorldCatalog 静态内容，不改变 GameState/save schema。
- 固定 dialogue NPC 继续参与脚底碰撞；位置选择必须保证从 entry 到 exit、private-room inspect 和 NPC interaction range 均有路。
- 未来日程系统必须单独决定同一 npcId 的 active spawn owner，不能通过复制实体模拟移动。

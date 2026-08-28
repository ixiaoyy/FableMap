# Town 家庭与居民 v1：实施计划

## 1. Resident content

1. 在 dialogue definitions 增加五名居民的住宅专属对话。
2. 补充阿禾与昊天现有对话中的家庭线索。
3. 在 visual profile 登记五个现有 NPC sheet frame。

## 2. House placement

1. 在五张住宅 TMJ 的 NpcSpawns 各加入一个固定 dialogue NPC。
2. 位置避开入口、返回出口、家具 Collision 和私人内屋 inspect。
3. 保持五张住宅 tile、interaction、exit 与 spawn 合同不变。

## 3. Focused contract

1. 扩展现有 Town 单一合同，断言五名居民的 region/entity/npc/dialogue/type 映射。
2. 断言五名居民脚底阻挡成立，但 entry 可抵达其 42px 交互范围、exit 与 private-room 门口。
3. 断言五个 dialogueId 均存在，外观 npcId 均登记。

## 4. Minimal validation

```powershell
npm --prefix .\apps\mirror-island run test:town-population
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
```

不运行全量测试或增加日程/好感测试矩阵。

## Rollback

- 新居民只涉及五个 NpcSpawns、五个 frame 和对话文本；可按 stable ID 精确撤销。
- 不整文件恢复 visual profile、dialogue definitions 或 Town 合同，避免覆盖并行任务改动。

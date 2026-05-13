# PRD：叙事道具经济系统（金币 + 物品）

> Compact pending-task summary. Verbose planning detail was removed to reduce AI context noise; re-expand from git history only if this task is resumed.

- Status: no-task
- Task dir: `05-13-item-economy-system`
- Scope: 待重新确认

## Preserved hints
- PRD：叙事道具经济系统（金币 + 物品）
- **任务 ID**：05-13-item-economy-system
- 一、背景与动机
- FableMap 当前已有 `Engagement` 纪念币框架（`WORLD_SCHEMA.md` 第十一-A 节），但其触发条件仅限于"完成玩法"，且 Schema 较复杂。
- **NPC 在对话中给你物品 → 物品有金币价值 → 访客自动获得对应金币**
- 这套系统存在于叙事层，不是真实货币，不涉及充值/结算/平台抽成。
- 二、目标
- 1. **单一货币**：全局只有「金币」一种货币，`coin_label` 固定为 `"金币"`。

## Resume policy
- Before implementing, re-confirm scope with current product docs/code.
- Do not treat this old planning note as a current approved contract.

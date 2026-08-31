# NPC 动态生活对话 v1：技术设计

## Ownership

- `client/src/game/dialogue/definitions.ts` 继续作为 speaker、固定 inspect 文案和 NPC 内容的唯一 owner。
- 增加 `DialogueContext { day, minuteOfDay, shopAvailable? }` 与确定性 resolver；resolver 通过现有 `schedulePhaseAt()` 选择 phase，再以 `(day - 1) % variants.length` 选择当日版本。
- `WorldScene.interactWithNpc()` 只传现有 snapshot 上下文；距离、friendship、Shop/Dialogue 分流顺序不改变。

## Data Shape

```typescript
interface ContextualDialogueDefinition extends DialogueDefinition {
  readonly variants: Readonly<Record<NpcSchedulePhase, readonly DialogueLines[]>>;
}

interface DialogueContext {
  readonly day: number;
  readonly minuteOfDay: number;
  readonly shopAvailable?: boolean;
}
```

- 普通 `DialogueDefinition` 继续服务 inspect 和错误提示。
- 居民 base definition 保留 fallback lines，contextual registry 只按已有 dialogueId 覆盖 lines，不复制 speaker。
- resolver 返回防御性只读 definition，不暴露 registry mutable reference。

## Compatibility

- 无存档升级；刷新只由现有 day/minuteOfDay 重新算出相同结果。
- 同一天同一 phase 内容稳定，避免重复点击刷随机台词；跨 phase 或下一天才变化。
- day phase 且 `shopAvailable=true` 的华强返回商店 welcome；前往柜台期间返回开店准备文案，其余 phase 保持普通 dialogue interactionType。

## Risks

- 台词若提到未实现采矿、钓鱼、工具升级或送礼，会形成虚假功能承诺；内容只描述观察、准备和生活细节。
- phase 与 region 由现有 schedule 保证；不在 dialogue registry 复制坐标或 regionId。

# 家园猫狗 MVP：技术设计

## State Contract

```typescript
type PetSpecies = "cat" | "dog";

interface PetState {
  readonly species: PetSpecies;
  readonly name: string;
  readonly adoptedDay: number;
  readonly bond: number;
  readonly lastPettedDay: number;
}

interface GameState {
  // existing v8 fields...
  readonly pet: PetState | null;
}
```

- GameState/StoredGame 一次升为 v9；v8→v9 只补 `pet: null`。
- 名字 trim 后 1～12 个 Unicode code points；空白、控制字符和超长明确失败。
- `bond` 为 0..100 隐藏整数；`lastPettedDay` 为 0 或不晚于当前 day。

## Commands

```typescript
type PetCommand =
  | { readonly type: "adopt-pet"; readonly species: PetSpecies; readonly name: string }
  | { readonly type: "pet-home-pet" };
```

- `adopt-pet` 只在 Day≥2 且 `pet===null` 成功；一次写入后不可更换。
- 取消领养不发命令、不写 seen ID，因此当天稍后或下次 playing 仍可提示。
- `pet-home-pet` 只在 Farm/Cottage、宠物 projection 可交互且当日未抚摸时使 bond+1/lastPettedDay=day；重复点击只返回温和反馈。

## Presentation

- 宠物位置/动作不进入 save。Farm/Cottage 各提供少量稳定 PetAnchor，client 按时间和确定性短路径表现 idle/walk/rest。
- 06:00–18:00 主要在 Farm，18:00–24:00 主要在 Cottage；切区时直接按目标 anchor 淡入，不模拟跨地图连续路径。
- 宠物没有碰撞体，不阻挡玩家/NPC/出口；使用独立点击范围。
- 每日首次抚摸播放短动作、爱心和一句带名字的反馈；不显示 bond。

## Adoption UI

- Day2 首次 playing 显示一张可关闭 modal：猫/狗预览、名字输入、不可更换说明、确认/稍后再说。
- Day≥2 的旧 v8→v9 `pet:null` 存档使用同一规则补发。
- modal 复用现有输入锁、焦点恢复、手机滚动和错误状态，不增加新 NPC 或日程。

## Media Boundary

- 采用 bluecarrot16 `[LPC] Cats and Dogs` 原始 cat/dog 512×256 PNG，并选择页面提供的 CC BY 3.0 许可；产品 NOTICE 交付署名。
- 运行时固定选择橘猫与黄犬 32×32 四方向 walk、中间 idle 和左右 rest 帧；不开放颜色/品种选择，不裁图或重编码。
- 正式对象走 `game/media/v1` manifest/CDN；缺图时仅用 code-drawn fallback 保证玩法可继续，Git 媒体二进制为零。

## Rollback

- v9 save 不允许降级覆盖；若 presentation 回滚，pet durable 字段继续安全保留并 forward-fix。
- 不创建数据库 migration；只增加 IndexedDB value schema v8→v9 decoder migration。

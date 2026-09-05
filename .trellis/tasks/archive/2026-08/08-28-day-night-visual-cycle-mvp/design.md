# 昼夜视觉变化 MVP：技术设计

## Visual strategy

- 情绪温度：清晨柔和、白天清澈、黄昏温暖、夜晚宁静，不做恐怖或高对比黑夜。
- 主色关系：浅玫瑰晨曦 → 无遮罩白天 → 琥珀/陶土黄昏 → 暮紫/靛蓝夜色。
- 色彩剂量：室外中等、室内克制；最大透明度室外 0.44、室内 0.12。
- 非颜色提示：LifeHud 已显示 `HH:MM`，因此昼夜不只依赖颜色传达。

## Ownership and flow

```text
GameSession GameState { minuteOfDay, player.regionId }
  -> game-store readonly projection
  -> daylightVisualAt(minuteOfDay, regionId)
  -> App.vue CSS custom properties + data attributes
  -> .world-frame::after
     canvas tinted with mix-blend-mode: multiply
     Vue HUD/modal z-index remains above overlay
```

GameSession/time/save 不新增字段。daylight 是 client presentation pure projection，不反馈到 Phaser/domain。

## Daylight projection

新增 `client/src/game/presentation/daylight.ts`：

```typescript
type DaylightPhase = "dawn" | "day" | "dusk" | "night";
type DaylightEnvironment = "outdoor" | "indoor";

interface DaylightVisual {
  readonly phase: DaylightPhase;
  readonly environment: DaylightEnvironment;
  readonly color: `#${string}`;
  readonly opacity: number;
}

function daylightVisualAt(minuteOfDay: number, regionId: string): DaylightVisual;
```

Outdoor keyframes：

| 时间 | 色彩角色 | opacity |
|---|---|---:|
| 06:00 | muted rose dawn | 0.16 |
| 07:00 | clear day | 0.00 |
| 15:00 | clear day plateau | 0.00 |
| 16:00 | warm pre-dusk | 0.02 |
| 17:00 | amber dusk | 0.08 |
| 18:00 | terracotta dusk | 0.14 |
| 20:00 | violet twilight | 0.28 |
| 21:00 | indigo night | 0.36 |
| 24:00 | deep indigo | 0.44 |

Indoor 使用独立暖灰紫关键帧，07:00–16:00 为 0，24:00 最大 0.12。任意合法 10 分钟 minute 在相邻 keyframe 间线性插值 RGB 与 opacity；phase 边界为 07:00、17:00、21:00。

## Region classification

新增纯 `world/region-environment.ts` 统一导出 `isOutdoorRegion(regionId)`；Farm、Town、Foothills、Lakeshore 返回 true，其余已登记室内返回 false。美术 profile 与 daylight 复用同一地区分类，不复制 ID 集合，也避免纯投影测试导入带 `import.meta.env` 的媒体 catalog。

## Vue/CSS layer

- game-store 只新增 transient `regionId` read model，来自 `state.player.regionId`；clear 时置空。
- App.vue computed 输出 `--daylight-color`、`--daylight-opacity`、`data-daylight` 和 `data-environment`。
- `.world-frame::after` 固定 inset 0、z-index 2、pointer-events none、multiply；canvas 在下，LifeHud/Hotbar/feedback/modal 在 z-index 3+。
- 仅在 `prefers-reduced-motion: no-preference` 中添加约 700ms linear color/opacity transition；reduced motion 直接更新。
- CSS overlay 随响应式容器尺寸自动覆盖，无需处理 Phaser camera zoom/FIT。

## Compatibility and rollback

- StoredGame v4、GameSession clock、Phaser camera、Tiled、素材、数据库与依赖均不变化。
- 未知 region 安全按 indoor 低强度处理，不把视觉分类升级为 gameplay 权限。
- 回滚仅涉及 daylight projection、game-store region read model、App CSS variables 和 overlay styles。

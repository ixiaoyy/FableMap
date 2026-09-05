# 昼夜视觉变化 MVP：实施计划

## 1. Pure projection

1. 导出唯一 outdoor region classifier 并复用现有 visual profile 分支。
2. 新增 outdoor/indoor keyframes、phase resolver、RGB/opacity interpolation。
3. 从 domain `decodeGameMinute` 复用合法时间校验，不复制范围规则。

## 2. Client projection and layer

1. game-store 投影当前 player regionId，不改 GameState。
2. App.vue 计算 daylight CSS variables/data attributes。
3. style.css 添加 isolated canvas overlay，并提升 telemetry/feedback 到 overlay 上层。
4. 过渡仅在 no-preference 下启用，保持 HUD/modal 对比度。

## 3. Focused contract and docs

1. Town 合同断言关键时间、线性中点、室内低强度、非法 minute 和 region 分类。
2. 更新 code-spec、产品边界与 Town 路线图昼夜项；路灯/点光源仍留作后续。

## 4. Minimal validation

```powershell
npm --prefix .\apps\mirror-island run test:town-population
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
node C:\Users\phpxi\.codex\skills\impeccable\scripts\detect.mjs --json <changed UI targets>
```

最终改动后只运行一次；不连接数据库、不运行身份、Life Loop 全套或 E2E。

## Risk points

- overlay z-index 不能覆盖 HUD/modal 或拦截 pointer input。
- 不用 Phaser world rectangle，避免 camera zoom/scroll/FIT 尺寸误差。
- RGB/opacity 必须按 minute 连续插值，不能只切四个离散 class。
- region 分类只影响表现，不进入 domain 或存档。

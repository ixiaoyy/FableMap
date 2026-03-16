# Map Assets Frontend Baseline

## 背景

当前 FableMap 前端地图主舞台主要由 [`frontend/src/WorldMap.jsx`](frontend/src/WorldMap.jsx) 使用 Canvas 进行程序绘制。

现状特点：

- 地图底板、道路、节点、光晕、标签主要由代码直接生成
- `vibe_profile` 已经影响配色，但尚未进入正式 sprite 资源切换
- 前端目录下当前还没有稳定的 `assets/isometric` 资源结构
- 地图资源生成脚本与资源规划文档已经出现，但尚未形成明确前端接入基线

因此，地图资源主线的下一步不应直接“大改 WorldMap”，而应先定义：

1. 资源放在哪里
2. 资源如何命名
3. `WorldMap` 应该从哪里接入资源
4. 如何渐进替换当前程序绘制层

---

## 目标

为 `M3` 建立最小前端接入基线，让后续协作者可以在不推翻当前地图交互层的前提下，把 Pack A / Pack B 资源逐步接入浏览器地图主舞台。

---

## 当前前端状态判断

根据当前 `frontend/src/WorldMap.jsx`：

### 已有能力

- 有稳定的 `vibe_profile -> palette` 映射
- 有道路、POI、landmark、hover、active、涟漪、发光、标签等程序绘制能力
- 有 `map2d.renderables` 作为主要渲染输入
- 有当前地图交互逻辑与 Canvas 生命周期

### 尚未具备的资源化能力

- 没有统一 sprite 资源目录
- 没有资源清单或 manifest
- 没有 `fantasy_type -> asset key` 的正式映射表
- 没有 `vibe_profile -> asset pack` 的正式选择器
- 没有图片预加载与失败降级机制

结论：

当前最合理的路径是 **“保留现有 Canvas 交互壳，逐层资源化替换绘制内容”**，而不是直接重写为另一套渲染系统。

---

## 建议目录结构

建议在前端新增稳定资源目录：

```text
frontend/src/assets/map-packs/
├── pack_a/
│   ├── scene/
│   │   └── scene_01.png
│   ├── icons/
│   │   ├── quest.png
│   │   ├── shop.png
│   │   ├── boss.png
│   │   ├── home.png
│   │   ├── echo.png
│   │   └── event.png
│   └── tiles/
│       ├── road_01.png
│       ├── road_02.png
│       ├── ground_01.png
│       ├── ground_02.png
│       ├── water_01.png
│       └── magic_01.png
└── pack_b/
    ├── scene/
    │   └── scene_01.png
    ├── icons/
    │   ├── quest.png
    │   ├── shop.png
    │   ├── boss.png
    │   ├── home.png
    │   ├── echo.png
    │   └── event.png
    └── tiles/
        ├── road_01.png
        ├── road_02.png
        ├── ground_01.png
        ├── ground_02.png
        ├── water_01.png
        └── garden_01.png
```

说明：

- 资源目录应对齐 `docs/MAP_ASSETS_PLAN.md` 的 pack 结构
- 场景图单独放在 `scene/`
- 图标与 tile 分层放置，避免后续引入更多类型时继续混放
- 未来若引入第 3 套资源包，可继续按 pack 维度平行扩展

---

## 建议清单文件

建议同时新增一个资源清单模块，例如：

- `frontend/src/mapAssets/manifest.js`
- 或 `frontend/src/mapAssets/manifest.ts`

最小结构建议：

```js
export const MAP_ASSET_PACKS = {
  pack_a: {
    scene: 'pack_a/scene/scene_01.png',
    icons: {
      quest: 'pack_a/icons/quest.png',
      shop: 'pack_a/icons/shop.png',
      boss: 'pack_a/icons/boss.png',
      home: 'pack_a/icons/home.png',
      echo: 'pack_a/icons/echo.png',
      event: 'pack_a/icons/event.png',
    },
    tiles: {
      road_01: 'pack_a/tiles/road_01.png',
      road_02: 'pack_a/tiles/road_02.png',
      ground_01: 'pack_a/tiles/ground_01.png',
      ground_02: 'pack_a/tiles/ground_02.png',
      water_01: 'pack_a/tiles/water_01.png',
      magic_01: 'pack_a/tiles/magic_01.png',
    },
  },
  pack_b: {
    scene: 'pack_b/scene/scene_01.png',
    icons: { ... },
    tiles: { ... },
  },
}
```

目标不是先把逻辑做复杂，而是先建立 **稳定文件寻址层**。

---

## `vibe_profile -> pack` 映射建议

当前 `WorldMap` 已有多种 `vibe_profile`：

- `ghibli_town`
- `quiet_rain`
- `neon_nostalgia`
- `amber_evening`
- `iron_blue`
- `chalk_dawn`

建议第一阶段不要为每个 vibe 都做独立 pack，而是先建立 **一对多映射**：

```js
const VIBE_TO_ASSET_PACK = {
  quiet_rain: 'pack_a',
  neon_nostalgia: 'pack_a',
  iron_blue: 'pack_a',
  ghibli_town: 'pack_b',
  amber_evening: 'pack_b',
  chalk_dawn: 'pack_b',
}
```

解释：

- `pack_a` 更适合夜景、霓虹、蓝紫、梦境类 vibe
- `pack_b` 更适合温暖、白天、故事书、治愈类 vibe

这样可以先把资源包用于“风格分流”，后续再细化到 vibe 专属资源。

---

## `fantasy_type -> icon asset` 映射建议

当前 `WorldMap` 仍以内建 emoji 表达 `fantasy_type`。建议先建立一层图标 key 映射，而不是直接把业务字段和文件名绑死：

```js
const FANTASY_TYPE_TO_ICON = {
  whispering_grove: 'echo',
  healing_sanctum: 'home',
  supply_outpost: 'shop',
  judgement_tower: 'boss',
  ember_parlor: 'shop',
  lore_academy: 'quest',
  debt_cathedral: 'boss',
  feast_hall: 'shop',
  refuel_station: 'event',
  memory_archive: 'echo',
  spirit_sanctum: 'echo',
  dormant_lot: 'event',
  remedy_post: 'home',
  labor_forge: 'boss',
  contract_spire: 'boss',
}
```

第一阶段只要求：

- 图标语义稳定
- 可以覆盖现有 fantasy_type
- 找不到资源时可回退到 emoji

---

## 渐进接入顺序

### Phase 1：图标资源化

优先级最高，风险最低。

做法：

- 保留现有 Canvas 绘制
- 只把 POI/landmark 的中心 icon 从 emoji 替换为 pack icon
- 保留当前发光、hover、active、选中逻辑
- 图片加载失败时回退到 emoji

意义：

- 最快让地图资源“真的出现”
- 不会破坏道路、底板、交互与摄像机逻辑

### Phase 2：场景底图接入

做法：

- 在当前程序绘制前，先绘制 pack scene 背景
- 把现有底色、渐变、发光视为前景氛围层或覆盖层
- 不要求 scene 与所有 tile 精确对齐，先作为整体风格底板

意义：

- 快速拉高第一眼质感
- 风险远低于直接做 tile 拼接

### Phase 3：tile 局部替换

做法：

- 先从局部层替换开始，例如：
  - 背景 ground 区块
  - 水域
  - 某些主路径 road 样式
- 只替换最容易对齐的图层
- 不一次性把全部道路和地表程序绘制删掉

意义：

- 降低 tile 拼接与坐标对齐风险
- 保持现有地图可用性

### Phase 4：正式资源驱动渲染

当 Phase 1~3 稳定后，再考虑：

- tile 规则铺装
- 更完整的 POI 建筑化
- 前景 / 中景 / 背景分层 sprite 化

---

## 最小技术接口建议

建议在前端新增：

- `frontend/src/mapAssets/manifest.js`
- `frontend/src/mapAssets/packSelector.js`
- `frontend/src/mapAssets/iconMapping.js`
- `frontend/src/mapAssets/loadImage.js`

职责建议：

### `manifest.js`
负责管理 pack 资源路径。

### `packSelector.js`
负责：
- 输入 `vibe_profile`
- 输出 `pack_a` 或 `pack_b`

### `iconMapping.js`
负责：
- 输入 `fantasy_type`
- 输出 icon key

### `loadImage.js`
负责：
- 图片预加载
- 缓存已加载图片
- 失败时返回 `null` 供上层回退

---

## 降级策略（必须有）

资源接入第一版必须保留降级能力：

1. 资源不存在 -> 回退到当前程序绘制
2. icon 加载失败 -> 回退到 emoji
3. scene 加载失败 -> 保留当前渐变背景
4. tile 加载失败 -> 继续使用当前 grid / block / road 绘制

原则：

> 资源化是增强，不是把当前地图一次性推翻。

---

## 验收标准

`M3` 第一阶段建议以“文档 + 接口基线”验收，而不是直接要求所有资源都渲染出来。

最小验收标准：

- 已定义稳定资源目录结构
- 已定义 `vibe_profile -> pack` 映射思路
- 已定义 `fantasy_type -> icon` 映射思路
- 已定义前端最小模块拆分建议
- 已定义明确降级路径
- 已明确渐进接入顺序

---

## 结论

当前 FableMap 前端最合理的资源接入策略不是“重写地图”，而是：

**保留现有 Canvas 世界地图壳 -> 先资源化图标 -> 再接入场景底板 -> 再局部 tile 替换 -> 最后再走完整资源驱动渲染。**

这条路径能最大程度降低风险，并把 Map Assets 主线真正接到现有前端上。 

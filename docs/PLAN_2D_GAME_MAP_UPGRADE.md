# 🎮 FableMap：2D 游戏地图升级计划（修订版）

**优先级：🔴 P0**
**状态：📋 修订中**
**范围：先完成“最小可行 2D 场景地图”，再逐步扩展**

---

## 📌 核心目标（本版聚焦）

当前 [`WorldMap`](frontend/src/WorldMap.jsx:172) 为**平面点线图**，本次升级要做到：

- ✅ 地图第一眼像**2D 游戏场景**，而不是数据可视化
- ✅ 地表/道路/水体/建筑/装饰具备**层级感与空间感**
- ✅ POI 从“点”升级为“**建筑/场景节点**”
- ✅ 首版依赖基础 sprite 资产（不接受占位图形）

> **本次计划不承诺一次性完成所有主题/动画/拖拽缩放。**

---

## 🧭 设计前提（根据参考图）

参考图的关键不是“更炫”，而是：

1. **地块化场景拼装**（道路、地表、建筑、树木）
2. **空间层级**（前景/中景/背景）
3. **真实可居住感**（房屋与道路产生“可走路径”）
4. **POI 为实体节点**，不是图标点位

---

## 🏗️ 技术路线（明确首版落地策略）

### 1) 等距坐标系统（保留）

```js
function tileToIsometric(tileX, tileY, tileSize = 32) {
  const screenX = (tileX - tileY) * (tileSize / 2)
  const screenY = (tileX + tileY) * (tileSize / 4)
  return { screenX, screenY }
}

function getDrawOrder(tileX, tileY) {
  return tileX + tileY
}
```

### 2) 素材策略（首版必须依赖基础 sprite 资产）

**策略确认：不接受占位图形，必须先准备基础 sprite 资源后再动手。**

- 地表：使用地表 tile sprite（草地/泥土/石地/水边）
- 道路：使用道路面片 sprite（直线/转角/交叉）
- 建筑：使用建筑 sprite（至少 3 类 POI 对应 3 类建筑）
- 装饰：使用树/灯/围栏/石块 sprite
- POI：图标与光晕附着于建筑之上

> 首版以“资源先行”为前提，未完成基础 sprite 资产之前不推进渲染实现。

---

## ✅ 修订后的阶段规划（细化版，可执行）

### Phase A：**资源准备与验收基线**（P0 起步）

**目标：** 先把渲染所需的基础 sprite 准备齐全，避免实现被资源卡住。

**任务：**
1. 定义地表 tile 规格（像素尺寸、透明边距、对齐基线）
2. 定义道路面片规格（直线/转角/交叉各 1 套）
3. 定义建筑 sprite 基线（底边对齐、阴影层）
4. 准备装饰 sprite（树/灯/围栏/石块各 ≥1）
5. 建立资源目录与命名规范

**验收：**
- 地表 tile sprite ≥ 4 张（草地/泥土/石地/水边）
- 道路面片 sprite ≥ 6 张（直线 2、转角 2、交叉 2）
- 建筑 sprite ≥ 3 类（至少覆盖 3 个 `fantasy_type`）
- 装饰 sprite ≥ 4 类（树/灯/围栏/石块）
- 资源目录与命名文档齐全

---

### Phase B：**等距底板与道路面片化**

**目标：** 从“平面图”升级为“等距场景底板 + 道路面片”。

**任务：**
1. 引入等距坐标投影与 z-order 排序
2. 使用地表 tile sprite 进行铺装
3. 将 `roads[]` 映射为道路面片序列（直线/转角/交叉）
4. 建立最小地表层 → 道路层渲染顺序

**改动文件：**
- [`WorldMap`](frontend/src/WorldMap.jsx:172)
- 可新增 [`isometric`](frontend/src/utils/isometric.js:1) 工具

**验收：**
- 等距投影无明显错位
- 地表 tile sprite 规则铺装且无错位
- 道路面片正确连接并可辨识路径方向
- 地图第一眼可识别为 2D 游戏场景

---

### Phase C：**POI 建筑化（实体节点）**

**目标：** 把 POI 变成建筑场景，而非图标点。

**任务：**
1. `fantasy_type` → 建筑 sprite 类型映射
2. `faction_alignment` → 建筑颜色/旗标覆盖层
3. active/hover 与建筑联动高亮
4. POI 光晕挂在建筑底座，不悬空

**验收：**
- 至少 3 类 POI 有明显不同建筑 sprite
- 点击 POI 时建筑被正确聚焦与高亮
- POI 标记不会漂浮脱离建筑底座

---

### Phase D：**环境装饰与空间层级**

**目标：** 增加树、桥、灯、石等环境元素，形成前后层次。

**任务：**
1. 前景树/岩石遮挡（前景层）
2. 水体边缘/桥等空间分割（中景层）
3. 装饰分布不遮挡 POI 主体
4. 形成前景 → 建筑 → 背景 的层级关系

**验收：**
- 前景装饰与建筑层存在明确遮挡关系
- 水体/桥能够形成视觉路径分割
- 装饰物不干扰 POI 识别

---

### Phase E：**交互增强（缩减版）**

**目标：** 只做最必要的交互，不追求花哨。

**任务：**
1. hover 信息提示
2. 点击高亮与选中反馈
3. 简单镜头聚焦（可选）

**验收：**
- hover 可稳定触发且不抖动
- 选中反馈与建筑实体绑定
- 不引入拖拽缩放

---

### Phase F：**多主题适配**

**目标：** 让 vibe 影响地表与建筑色调。

**任务：**
1. `vibe_profile` 控制地表/建筑/道路调色
2. 每个 vibe 至少 1 套可用调色方案

**验收：**
- vibe 切换时地表/建筑/道路同步变化
- 至少 2 种 vibe 可用

---

## ✅ 成功标准（更具体可验收）

- [ ] 地表/道路/建筑/装饰均使用 sprite 资源
- [ ] 道路是“面片路径”，不是折线
- [ ] POI 至少 3 类建筑 sprite 区分明显
- [ ] 地图边缘有环境封边，不再平均摊铺
- [ ] 第一眼可识别为 2D 游戏场景
- [ ] 渲染顺序稳定，无遮挡错乱

---

## 🚀 下一步执行建议（P0 起手）

建议先完成 **Phase A：资源准备与验收基线**，再进入 Phase B：

1. 建立 sprite 目录与命名规范
2. 准备地表/道路/建筑/装饰基础资源
3. 按 Phase A 验收标准确认资源齐备
4. 资源到位后再重构 [`WorldMap`](frontend/src/WorldMap.jsx:172) 渲染流程

---

## ✅ 已确认的资源策略

### 资源来源与获取方案

**来源确认：全量自制（不使用开源库与第三方包）**

| 资源类型 | 数量 | 来源 | 说明 |
|---------|------|------|------|
| 地表 tile | ≥4 | 自制 | 草地/泥土/石地/水边 |
| 道路面片 | ≥6 | 自制 | 直线/转角/交叉各 2 |
| 建筑 sprite | ≥3 | 自制 | 房屋/塔/店铺 |
| 装饰 sprite | ≥4 | 自制 | 树/灯/围栏/石块 |

**自制资源要点：**

1. **统一风格规范**
   - 色板统一（P0 只做 1 个 vibe）
   - 线条粗细与光照方向统一

2. **尺寸与对齐一致**
   - 统一底边基线
   - 透明边距一致

3. **输出格式**
   - PNG 透明背景
   - 文件名严格按命名规范

### 资源集成步骤

**1. 建立目录结构**
```
/frontend/src/assets/isometric/
├── terrain/
│   ├── grass.png
│   ├── dirt.png
│   ├── stone.png
│   └── water.png
├── roads/
│   ├── road_straight_h.png
│   ├── road_straight_v.png
│   ├── road_corner_tl.png
│   ├── road_corner_tr.png
│   ├── road_cross.png
│   └── road_end.png
├── buildings/
│   ├── house_1.png
│   ├── tower.png
│   └── shop.png
└── decorations/
    ├── tree_1.png
    ├── lamp_post.png
    ├── fence.png
    └── rock.png
```

**2. 预加载 sprite 资源**
```js
// frontend/src/utils/spriteLoader.js
export const sprites = {
  terrain: {},
  roads: {},
  buildings: {},
  decorations: {},
}

export async function loadSprites() {
  const terrainTypes = ['grass', 'dirt', 'stone', 'water']
  const roadTypes = ['straight_h', 'straight_v', 'corner_tl', 'corner_tr', 'cross', 'end']
  const buildingTypes = ['house_1', 'tower', 'shop']
  const decorationTypes = ['tree_1', 'lamp_post', 'fence', 'rock']

  const loadImage = (path) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = path
    })
  }

  // 加载所有 sprite
  for (const type of terrainTypes) {
    sprites.terrain[type] = await loadImage(`/assets/isometric/terrain/${type}.png`)
  }
  for (const type of roadTypes) {
    sprites.roads[type] = await loadImage(`/assets/isometric/roads/road_${type}.png`)
  }
  for (const type of buildingTypes) {
    sprites.buildings[type] = await loadImage(`/assets/isometric/buildings/${type}.png`)
  }
  for (const type of decorationTypes) {
    sprites.decorations[type] = await loadImage(`/assets/isometric/decorations/${type}.png`)
  }
}
```

**3. 在 WorldMap 中使用 sprite**
```js
// frontend/src/WorldMap.jsx
import { sprites, loadSprites } from './utils/spriteLoader'

export default function WorldMap({ world, ... }) {
  useEffect(() => {
    loadSprites().catch(err => console.error('Failed to load sprites:', err))
  }, [])

  function drawTerrainTile(ctx, x, y, terrainType) {
    const sprite = sprites.terrain[terrainType]
    if (sprite) {
      ctx.drawImage(sprite, x, y, 32, 32)
    }
  }

  function drawRoad(ctx, x, y, roadType) {
    const sprite = sprites.roads[roadType]
    if (sprite) {
      ctx.drawImage(sprite, x, y, 32, 32)
    }
  }

  function drawBuilding(ctx, x, y, buildingType) {
    const sprite = sprites.buildings[buildingType]
    if (sprite) {
      ctx.drawImage(sprite, x, y, 64, 64)
    }
  }

  function drawDecoration(ctx, x, y, decorationType) {
    const sprite = sprites.decorations[decorationType]
    if (sprite) {
      ctx.drawImage(sprite, x, y, 48, 48)
    }
  }
}
```

### 资源规格要求

**地表 tile：**
- 尺寸：32×32 像素（标准等距 tile）
- 格式：PNG（支持透明）
- 对齐：底边对齐，无额外边距

**道路面片：**
- 尺寸：32×32 像素
- 格式：PNG（支持透明）
- 类型：直线（水平/竖直）、转角（4 个方向）、交叉、端点

**建筑 sprite：**
- 尺寸：64×64 像素（等距建筑通常较大）
- 格式：PNG（支持透明）
- 对齐：底边对齐，阴影层在底部

**装饰 sprite：**
- 尺寸：48×48 像素
- 格式：PNG（支持透明）
- 对齐：底边对齐

---

## 📋 Phase A 详细任务清单

### Task A1：建立资源目录与命名规范
- [ ] 创建 `/frontend/src/assets/isometric/` 目录结构
- [ ] 编写资源命名规范文档
- [ ] 创建资源清单表格

### Task A2：准备地表 tile sprite
- [ ] 从 Kenney.nl 或 OpenGameArt 下载等距 tileset
- [ ] 提取 4 种地表 tile（草地/泥土/石地/水边）
- [ ] 验证尺寸和透明度
- [ ] 放入 `/frontend/src/assets/isometric/terrain/`

### Task A3：准备道路面片 sprite
- [ ] 提取 6 种道路面片（直线 2、转角 2、交叉 1、端点 1）
- [ ] 验证连接无缝
- [ ] 放入 `/frontend/src/assets/isometric/roads/`

### Task A4：准备建筑 sprite
- [ ] 提取至少 3 种建筑 sprite（房屋/塔/店铺）
- [ ] 验证底边对齐和阴影
- [ ] 放入 `/frontend/src/assets/isometric/buildings/`

### Task A5：准备装饰 sprite
- [ ] 提取至少 4 种装饰 sprite（树/灯/围栏/石块）
- [ ] 验证尺寸和对齐
- [ ] 放入 `/frontend/src/assets/isometric/decorations/`

### Task A6：资源验收与文档
- [ ] 编写资源清单与规格文档
- [ ] 验证所有 sprite 加载无误
- [ ] 更新 Phase A 验收清单

---

## 数量下限（已确认）

- **建筑 sprite**：≥ 3 类
- **道路面片 sprite**：≥ 6 张（直线/转角/交叉）
- **地表 tile sprite**：≥ 4 张（草地/泥土/石地/水边）
- **装饰 sprite**：≥ 4 类（树/灯/围栏/石块）

---

## ❓需要确认的事项（仅保留必要项）

1. P0 是否只做 1 个 vibe（如 `quiet_rain`）？
2. 是否允许暂不加入地图拖拽缩放？

---

> 本修订版目标：**先把地图做成“像 2D 游戏场景”，再谈美术精修与主题扩展。**

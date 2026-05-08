# Territory Map Claim System — Implementation

## 完成状态

- [x] Phase 1: 领地核心数据结构和碰撞检测算法
- [x] Phase 2: 领地存储层（JSON + MySQL 后端）
- [x] Phase 3: 领地 API 路由和应用服务
- [x] Phase 4: 地图可视化（领地边界圆形）

## 实现文件

### 后端

| 文件 | 说明 |
|------|------|
| `backend/src/fablemap_api/core/territory.py` | 领地核心数据结构、碰撞检测、Haversine 算法 |
| `backend/src/fablemap_api/infrastructure/territory_store.py` | JSON 和 SQLAlchemy 存储实现 |
| `backend/src/fablemap_api/application/territories.py` | 领地应用服务（业务逻辑编排） |
| `backend/src/fablemap_api/api/v1/territories.py` | API 路由定义 |
| `backend/src/fablemap_api/contracts/territories.py` | API 请求/响应模型 |
| `backend/src/fablemap_api/api/v1/router.py` | 注册领地路由 |
| `backend/src/fablemap_api/main.py` | 初始化领地服务 |

### 前端

| 文件 | 说明 |
|------|------|
| `frontend/app/product/mapAdapter/MapAdapter.js` | 添加领地圆形相关接口定义 |
| `frontend/app/product/mapAdapter/AMapAdapter.js` | 实现领地圆形绘制（AMap.Circle） |
| `frontend/app/lib/territoryService.js` | 前端领地 API 服务 |

## API 端点

```
GET  /api/v1/territories/check?lat=...&lon=...&radius=...&type=...
POST /api/v1/territories
GET  /api/v1/territories
GET  /api/v1/territories/nearby?lat=...&lon=...&radius=...&types=...
GET  /api/v1/territories/{id}
PUT  /api/v1/territories/{id}
DELETE /api/v1/territories/{id}
```

## 领地类型

| 类型 | 图标 | 颜色 | 默认半径 |
|------|------|------|----------|
| tavern | 🍺 | #FFD700 | 50m |
| pet_shop | 🐱 | #FF69B4 | 50m |
| garden | 🌱 | #32CD32 | 100m |
| game_workshop | 🎮 | #4169E1 | 50m |
| gacha | 🎰 | #9932CC | 50m |
| cultivation | 🏔️ | #8B4513 | 80m |
| shop | 🏪 | #FFD700 | 30m |
| warehouse | 📦 | #808080 | 20m |

## 碰撞检测规则

1. 同类型领地不可重叠
2. 不同类型领地可以重叠（功能分区）
3. 使用 Haversine 公式计算球面距离

## 待完善

- [ ] SQLAlchemy 数据库迁移脚本（添加 territories 表）
- [ ] 领地申领 UI 组件
- [ ] 领地管理面板
- [ ] WorldMap.jsx 集成领地圆形显示
- [ ] 单元测试

## 相关 Trellis 任务

- Parent: `05-07-05-07-new-features-pet-community-farming`
- Children:
  - `05-07-05-07-garden-tavern-farm-basics`
  - `05-07-05-07-garden-tavern-currency-economy`
  - `05-07-05-07-garden-tavern-exchange-system`
  - `05-07-05-07-garden-tavern-stealing-mechanics`
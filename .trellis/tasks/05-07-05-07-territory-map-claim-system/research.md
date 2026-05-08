# territory-map-claim-system Research

## 研究目标

为领地系统（Territory System）设计后端 API 和数据结构。

## 现有系统分析

### 酒馆（Tavern）已有字段
- `lat`, `lon` - 坐标
- `owner_id` - 所有者
- `status` - 状态
- `place_type` - 场所类型

### 地图系统
- `WorldMap.jsx` - 主地图组件
- `MapAdapter` - 地图适配器抽象
- 当前无领地边界可视化

## 数据模型设计

### Territory 类

```python
@dataclass
class Territory:
    id: str
    owner_id: str           # 所有者ID
    tavern_id: str | None   # 关联酒馆（可选）
    type: TerritoryType     # 领地类型
    center_lat: float       # 中心纬度
    center_lon: float       # 中心经度
    radius: float           # 半径（米）
    status: TerritoryStatus # 状态
    created_at: str
    updated_at: str
```

### TerritoryType 枚举

```python
class TerritoryType(str, Enum):
    TAVERN = "tavern"           # 酒馆
    PET_SHOP = "pet_shop"      # 宠物店
    GARDEN = "garden"          # 菜园
    GAME_WORKSHOP = "game_workshop"  # 游戏工坊
    GACHA = "gacha"             # 抽卡
    CULTIVATION = "cultivation" # 修炼
    SHOP = "shop"              # 商店
    WAREHOUSE = "warehouse"    # 仓库
```

### TerritoryStatus 枚举

```python
class TerritoryStatus(str, Enum):
    AVAILABLE = "available"     # 可申领
    CLAIMED = "claimed"         # 已申领（建设中）
    ACTIVE = "active"           # 已开放
    PAUSED = "paused"           # 暂停
    ABANDONED = "abandoned"     # 已废弃
```

## API 设计

### 端点

```
GET  /api/v1/territories/check?lat=...&lon=...&radius=...&type=...
     → 检查位置是否可用

POST /api/v1/territories/claim
     Body: { type, center_lat, center_lon, radius, tavern_id? }
     → 申领领地

GET  /api/v1/territories/{id}
     → 获取领地详情

PUT  /api/v1/territories/{id}
     Body: { radius?, status? }
     → 更新领地

DELETE /api/v1/territories/{id}
     → 废弃领地

GET  /api/v1/territories/nearby?lat=...&lon=...&radius=...&types=...
     → 查询附近领地
```

## 碰撞检测算法

### 球面距离计算

使用 Haversine 公式计算两点间球面距离：

```python
import math

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371000  # 地球半径（米）
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c
```

### 碰撞检测

```python
def check_collision(territory1, territory2) -> bool:
    """检测两个领地是否碰撞（同类型不能重叠）"""
    if territory1.type != territory2.type:
        return False  # 不同类型可以重叠

    distance = haversine_distance(
        territory1.center_lat, territory1.center_lon,
        territory2.center_lat, territory2.center_lon
    )
    return distance < (territory1.radius + territory2.radius)
```

### 可用性检查

```python
def is_location_available(lat, lon, radius, territory_type, existing_territories) -> tuple[bool, str]:
    """检查位置是否可申领"""
    for territory in existing_territories:
        if territory.type != territory_type:
            continue
        if territory.status not in ["active", "claimed"]:
            continue

        distance = haversine_distance(lat, lon, territory.center_lat, territory.center_lon)
        if distance < (radius + territory.radius):
            return False, f"此处已有同类领地: {territory.name}"

    return True, "可用"
```

## 数据库模型

### SQLAlchemy 模型

```python
class TerritoryModel(Base):
    __tablename__ = "territories"

    id = Column(String(64), primary_key=True)
    owner_id = Column(String(64), nullable=False)
    tavern_id = Column(String(64), ForeignKey("taverns.id"), nullable=True)
    type = Column(String(32), nullable=False)  # TerritoryType
    center_lat = Column(Float, nullable=False)
    center_lon = Column(Float, nullable=False)
    radius = Column(Float, nullable=False)  # 米
    status = Column(String(32), nullable=False)  # TerritoryStatus
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

## 地图可视化

### MapAdapter 扩展

添加新方法支持领地圆形：

```typescript
interface TerritoryCircle {
  id: string
  center: [number, number]  // [lon, lat]
  radius: number  // 米
  type: string
  status: string
  color: string
}

// MapAdapter 新增方法
addTerritoryCircles(circles: TerritoryCircle[]): void
removeTerritoryCircles(ids: string[]): void
clearTerritoryCircles(): void
```

### 颜色映射

```typescript
const TERRITORY_COLORS: Record<string, string> = {
  tavern: '#FFD700',
  pet_shop: '#FF69B4',
  garden: '#32CD32',
  game_workshop: '#4169E1',
  gacha: '#9932CC',
  cultivation: '#8B4513',
  shop: '#FFD700',
  warehouse: '#808080',
}
```

## 实现顺序

1. **领地数据结构** - core/territory.py
2. **领地存储** - infrastructure/territory_store.py
3. **领地服务** - application/territory_service.py
4. **API 路由** - api/v1/territories.py
5. **地图可视化** - MapAdapter + WorldMap
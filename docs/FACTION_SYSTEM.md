# FableMap 阵营系统设计

## 目标

阵营系统的目标，是让地点不只是景观，而是成为**权力、资源、立场与控制力**的节点。

玩家不是地图游客，而是世界结构中的参与者。

## 设计原则

### 1. 阵营必须从城市结构中长出来

阵营不是凭空设定的世界观名词，而是要能回指现实中的区域属性：

- 高消费商务区
- 老工业区
- 物流节点
- 医疗区
- 校园区
- 夜生活街区

### 2. 阵营要有利益，不只是风格

每个阵营都需要回答：

- 它想控制什么资源？
- 它为什么需要这个地区？
- 它和其他阵营的矛盾是什么？

### 3. 玩家影响应该来自“真实移动”

最有意思的不是点击菜单，而是：

- 你走过哪条路
- 你在哪停留
- 你经常出现在哪类地点
- 你把资源从哪里带到了哪里

## 阵营 Archetype

第一批可用 archetype 建议：

- `trade_guild`：自由贸易与物流网络
- `order_bureau`：秩序、监管、巡逻与审判
- `scrap_union`：工业残骸、修补者、地下工坊
- `clinic_circle`：治疗、药剂、生物伦理边界
- `memory_collective`：档案、历史回声、地点秘密
- `night_bloom`：夜生活、审美经济、流行文化与感官消费

## 阵营核心属性

每个阵营建议拥有以下字段：

- `id`
- `name`
- `archetype`
- `doctrine`：核心价值与叙事语气
- `influence`：总体影响力
- `resource_focus`：偏好的资源类型
- `territories`：主要控制区域
- `relations`：与其他阵营的关系

## 地区控制力

每个区域不必只有单一归属，但应有主导结构。

建议字段：

- `dominant_faction`
- `control_score`
- `contested_by`
- `strategic_value`

### `control_score` 的来源

- 阵营历史占领权重
- 对应类型 POI 数量
- 资源流经过频率
- 玩家行为的长期累积
- 当前动态扰动修正

## 资源模型

阵营争夺的不只是领土，还包括资源。

建议第一批资源类型：

- `supplies`：补给
- `attention`：流量与关注
- `data_shards`：信息碎片
- `medicine`：治疗资源
- `luxury`：奢侈与身份符号
- `scrap`：工业残片与改造材料

不同区域会天然偏向产出不同资源。

## 玩家与阵营的关系

### 声望 `reputation`

玩家对每个阵营都应有独立声望值，声望可因以下行为变化：

- 进入其控制区
- 完成其倾向任务
- 携带资源经过其路线
- 破坏其利益或帮助敌对阵营

### 倾向 `alignment`

玩家不一定正式加入某阵营，但会形成长期倾向。

例如：

- 经常在高秩序区停留 -> 更偏 `order_bureau`
- 常走物流与商业路线 -> 更偏 `trade_guild`
- 常在工业边缘区活动 -> 更偏 `scrap_union`

## 通勤影响模型

这是阵营系统最有区别度的部分。

### 基本逻辑

玩家每天的现实移动，会被系统理解为一种隐性的世界行动：

- 从 A 区到 B 区 -> 可能等价于运输资源
- 频繁进入某类地点 -> 可能等价于建立情报线或补给线
- 在争议区域停留 -> 可能改变地区稳定度

### 建议记录项

- `route_segments`
- `visit_frequency`
- `cross_faction_trips`
- `resource_transfer_events`

## 阵营关系类型

建议关系不只分敌我，而是更细：

- `allied`
- `neutral`
- `tense`
- `hostile`
- `dependent`
- `infiltrating`

这样 NPC 与事件的表现会更有层次。

## 与其他系统的连接

### 与动态扰动模型

- `social_tension` 高时，秩序型阵营巡逻增强
- `commerce_flux` 高时，贸易型阵营更活跃
- `anomaly_pressure` 高时，记忆/谜团型阵营更容易触发事件

### 与审美情感系统

阵营不只影响冲突，也能影响美学气质：

- `night_bloom` 会增强霓虹、时尚、夜色与流行文化风格
- `memory_collective` 会强化旧照片感、档案室感和秘密锚点

## 建议写入 Schema 的字段

### `factions[*]`

- `doctrine`
- `resource_focus`
- `influence`
- `relations`

### `region`

- `dominant_faction`
- `control_score`
- `strategic_value`

### `state`

- `faction_states`
- `reputation`
- `route_impact`
- `resource_transfers`

## 第一版与后续边界

### v0.1 不做

- 不做实时多人阵营战争
- 不做复杂市场结算
- 不做完整 NPC 政治模拟

### v0.2+ 的最小实现

- 先定义 3~4 个基础阵营 archetype
- 先做静态地区偏好与简单声望值
- 先让通勤路径改变少量 `control_score`
- 先让阵营影响 POI 文案和事件风格

## 核心结论

阵营系统的价值，不在于把城市变成一张领土色块图，而在于让玩家开始感觉：自己每天走过的路线，正在悄悄改变这个第二世界的权力结构。
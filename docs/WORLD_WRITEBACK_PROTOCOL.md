# FableMap 世界写回协议 v0.1

## 文档目的

这份文档定义 FableMap 下一阶段的统一世界写回协议草案。

它的目标不是立刻穷尽所有未来玩法，而是先为“玩家行为如何进入世界、世界如何产生状态变化、这些变化如何被看见与保留”建立一套统一语言。

这份协议主要服务四类对象：

1. 后端事件处理器
2. API 输入输出结构
3. 前端交互动作与状态回写
4. 后续 `P3` 治理边界与 `P4` 时间深度扩展

---

## 一句话结论

FableMap 的写回系统，第一版应统一为：

> **玩家动作 -> 世界事件 -> 状态变化 -> 世界反馈 -> 可见性约束 -> 持久化沉淀**

其中第一阶段只要求先跑通：

- `observe`
- `dwell`
- `mark`

三种最小行为。

---

## 为什么需要统一协议

当前仓库已经具备：

- 世界生成能力
- 浏览器 2D 地图主舞台
- 玩家移动、观察、侧边信息、视觉代理与回声前置层
- D3 提供的参与叙事入口

但这些能力仍主要停留在：

- 玩家可以看
- 玩家可以走
- 玩家可以点
- 世界可以解释

真正还没有被统一的是：

- 玩家做了什么，如何被系统定义为一次有效行为
- 行为作用到了哪个对象
- 这个行为改写了哪些状态
- 哪些变化只属于自己，哪些能进入公共层
- 哪些痕迹会被时间沉淀为世界记忆

因此，本协议的核心作用是把“交互”升级成“演化”。

---

## 设计原则

### 1. 先复用已有状态轴，再新增字段

新增写回能力时，应优先挂接到 [`docs/PLAYER_STATE.md`](docs/PLAYER_STATE.md) 既有状态轴，例如：

- `action_state`
- `clarity`
- `tension`
- `attunement`
- `zone_familiarity.<zone_id>`
- `poi_familiarity.<poi_id>`
- `route_familiarity.<route_id>`

只有当某类写回完全无法被现有状态语言表达时，才新增新字段。

### 2. 协议优先于存储

第一版应先固定事件结构与 effect 语义，再决定底层是 JSON、SQLite 还是 PostgreSQL。

### 3. 可见性从第一版就进入协议

`private / local_public / global` 不是后补权限字段，而是写回的基础语义之一。

### 4. 世界反馈必须可结构化返回

一次写回不能只返回一段文案，而应返回可被前端渲染的结构化变化结果。

### 5. 时间沉淀是后续扩展，不抢占第一版主线

第一版先解决“有没有发生有效写回”，第二版再解决“这些写回如何跨时间沉淀”。

---

## 协议总览

统一写回链路建议表示为：

1. 前端触发一个玩家动作
2. 动作被包装为一个 `writeback event`
3. 后端解析事件目标与上下文
4. 后端生成 `effects`
5. 后端返回新的玩家状态、地点状态与世界反馈
6. 系统按 `visibility` 判断哪些变化应被存储、公开或继续处理
7. 后续历史层再决定哪些变化进入 `recent_echoes` 或 `archived_layers`

---

## 一、核心对象定义

### 1. Writeback Event

`writeback event` 表示一次被系统接受并进入世界状态链路的玩家行为。

最小字段：

- `event_id`
- `event_type`
- `player_id`
- `timestamp`
- `target`
- `payload`
- `visibility`
- `source`
- `context`

#### 建议结构

```json
{
  "event_id": "evt_20260313_0001",
  "event_type": "observe",
  "player_id": "player_local",
  "timestamp": "2026-03-13T17:00:00Z",
  "target": {
    "target_type": "poi",
    "target_id": "poi_clocktower_01",
    "slice_id": "slice_shibuya_35_6580_139_7016_300"
  },
  "payload": {
    "intensity": 1,
    "note": null
  },
  "visibility": "private",
  "source": {
    "client": "web",
    "surface": "poi_detail_panel",
    "version": "v0.1"
  },
  "context": {
    "current_zone_id": "zone_shibuya_core",
    "nearest_poi_id": "poi_clocktower_01",
    "player_position": {
      "x": 412,
      "y": 285
    }
  }
}
```

### 2. Target

`target` 定义本次行为作用到谁。

第一版支持：

- `poi`
- `zone`
- `route`
- `home`
- `world`

最小字段：

- `target_type`
- `target_id`
- `slice_id`

可选字段：

- `coordinates`
- `zone_id`
- `poi_id`
- `route_id`
- `scope_hint`

### 3. Effects

`effects` 表示一次事件引起的结构化变化结果。

第一版统一拆成三层：

- `player_effects`
- `place_effects`
- `world_effects`

结构上建议既保留“数值变化”，也保留“新增记录”。

### 4. Visibility

`visibility` 表示本次写回默认属于哪个可见层级。

第一版固定为：

- `private`
- `local_public`
- `global`

### 5. World Feedback

`world_feedback` 表示世界对本次行为的可视化或叙事回响。

它不等于完整文案，而是可供前端消费的反馈结构，例如：

- `broadcast_hints`
- `echo_entries`
- `revealed_fields`
- `ui_state_changes`
- `home_updates`

---

## 二、事件类型 v0.1

第一版协议只正式支持三种行为：

- `observe`
- `dwell`
- `mark`

之所以限制到这三种，是因为它们已经足够证明最小闭环：

- 玩家有动作
- 地点被改写
- 世界有反馈
- 痕迹可以保留

### 1. `observe`

#### 语义

玩家主动观察一个地点，尝试理解其表层与潜在含义。

#### 典型触发方式

- 点击地点详情中的“观察”按钮
- 在地图上选中 `poi` 后执行观察动作

#### 推荐目标

- `poi`
- 次选 `zone`

#### 建议 payload

- `focus_mode`：如 `surface / symbolic / anomaly`
- `intensity`：默认 `1`
- `note`：可选，第一版可为空

#### 建议 effect

- `action_state -> observing`
- `attunement +1`
- `poi_familiarity.<poi_id> +1`
- `revealed_fields += [...]`
- `echo_entries += session_observation_echo`

#### 默认 visibility

- `private`

#### 示例

```json
{
  "event_type": "observe",
  "target": {
    "target_type": "poi",
    "target_id": "poi_clocktower_01",
    "slice_id": "slice_a"
  },
  "payload": {
    "focus_mode": "symbolic",
    "intensity": 1
  },
  "visibility": "private"
}
```

### 2. `dwell`

#### 语义

玩家在某个地点或区域停留，让世界逐渐回应其存在。

#### 典型触发方式

- 玩家在某区域停留数秒
- 玩家主动点击“驻足”

#### 推荐目标

- `zone`
- 次选 `poi`

#### 建议 payload

- `duration_ms`
- `stance`：如 `idle / attentive / resting`
- `trigger_source`：`auto` 或 `manual`

#### 建议 effect

- `action_state -> idle` 或 `observing`
- `clarity +1`
- `tension -1`
- `zone_familiarity.<zone_id> +1`
- 按概率追加 `local_echo`
- 可选增加 `warmth +1`

#### 默认 visibility

- `private`

#### 示例

```json
{
  "event_type": "dwell",
  "target": {
    "target_type": "zone",
    "target_id": "zone_shibuya_core",
    "slice_id": "slice_a"
  },
  "payload": {
    "duration_ms": 4200,
    "stance": "resting",
    "trigger_source": "manual"
  },
  "visibility": "private"
}
```

### 3. `mark`

#### 语义

玩家为地点留下一个轻量语义标记，使地点开始带有个人视角的标签。

#### 典型触发方式

- 在地点详情中选择固定标签
- 在选中地点后点击“留痕”或“标记”

#### 推荐目标

- `poi`
- 次选 `zone`

#### 第一版建议限定标签池

- `safe`
- `uncanny`
- `warm_corner`
- `return_again`
- `rain_friendly`

#### 建议 payload

- `mark_type`
- `note`：可选，第一版建议限制长度
- `style_lens`：可选

#### 建议 effect

- 新增一条 `place_mark`
- `poi_familiarity.<poi_id> +1`
- 地点详情新增“你的标记”分组
- 镜像家园或收藏系统可引用该标记

#### 默认 visibility

- `private`

#### 示例

```json
{
  "event_type": "mark",
  "target": {
    "target_type": "poi",
    "target_id": "poi_teahouse_02",
    "slice_id": "slice_a"
  },
  "payload": {
    "mark_type": "warm_corner",
    "note": "适合雨天回来"
  },
  "visibility": "private"
}
```

---

## 三、Target Schema v0.1

### 必填字段

```json
{
  "target_type": "poi",
  "target_id": "poi_clocktower_01",
  "slice_id": "slice_a"
}
```

### 字段说明

- `target_type`：目标类型，取值为 `poi / zone / route / home / world`
- `target_id`：目标实体 ID
- `slice_id`：本次行为发生的世界切片 ID

### 可选字段

```json
{
  "target_type": "poi",
  "target_id": "poi_clocktower_01",
  "slice_id": "slice_a",
  "coordinates": {
    "lat": 35.658,
    "lon": 139.7016
  },
  "zone_id": "zone_shibuya_core",
  "scope_hint": "poi_detail"
}
```

### 目标约束建议

- `observe` 应优先指向 `poi` 或 `zone`
- `dwell` 应优先指向 `zone`
- `mark` 应优先指向 `poi`
- 第一版暂不允许 `mark` 直接写入 `world` 层

---

## 四、Effect Schema v0.1

一次事件的返回结果建议统一为：

```json
{
  "player_effects": [],
  "place_effects": [],
  "world_effects": [],
  "state_snapshot": {},
  "world_feedback": {}
}
```

### 1. `player_effects`

表示玩家状态变化。

建议 effect 原子结构：

```json
{
  "path": "attunement",
  "op": "increment",
  "value": 1,
  "reason": "observe.poi"
}
```

常见路径：

- `action_state`
- `clarity`
- `tension`
- `attunement`
- `warmth`
- `current_zone_id`
- `nearest_poi_id`

### 2. `place_effects`

表示地点、区域或路线状态变化。

示例：

```json
{
  "path": "poi_familiarity.poi_clocktower_01",
  "op": "increment",
  "value": 1,
  "reason": "observe.poi"
}
```

常见路径：

- `poi_familiarity.<poi_id>`
- `zone_familiarity.<zone_id>`
- `route_familiarity.<route_id>`
- `place_marks[]`
- `revealed_fields[]`
- `memory_bindings[]`

### 3. `world_effects`

表示对世界反馈层的影响。

示例：

```json
{
  "path": "recent_echoes",
  "op": "append",
  "value": {
    "type": "observation_echo",
    "target_id": "poi_clocktower_01"
  },
  "reason": "observe.poi"
}
```

常见路径：

- `recent_echoes`
- `broadcast_hints`
- `local_myth_signals`
- `active_overlays`
- `home_inventory_updates`

### 4. `state_snapshot`

`state_snapshot` 用于返回当前写回后的关键状态截面，便于前端直接刷新。

建议至少包含：

- `player_state`
- `place_state`
- `world_feedback`

### 5. `world_feedback`

建议结构：

```json
{
  "broadcast_hints": [],
  "echo_entries": [],
  "revealed_fields": [],
  "ui_state_changes": [],
  "home_updates": []
}
```

---

## 五、Visibility Schema v0.1

### 1. `private`

表示仅对玩家本人可见的写回。

适合：

- 个人熟悉度变化
- 私人地点标签
- 个人观察回声
- 私密记忆与家园引用

### 2. `local_public`

表示可进入某个区域的公共层，但不影响全局世界规则。

适合：

- 某区域共享地点传闻
- 区域回声池
- 小范围公共修复痕迹
- 地点公共情绪标签

### 3. `global`

表示可能进入全局世界叙事层的高门槛写回。

适合：

- 长期保留的城市神话命名
- 全城广播中的常驻条目
- 阵营或世界规则层变动

### 第一版约束

- `observe` 默认只能是 `private`
- `dwell` 默认只能是 `private`
- `mark` 默认只能是 `private`
- `local_public` 与 `global` 在 v0.1 中仅保留结构位，不默认开放给前端普通动作

这意味着：

> v0.1 的重点是先证明“写回成立”，而不是立刻开放公共共创。

---

## 六、API 输入输出建议

第一版建议新增最小接口：

- `POST /api/world/event`

### 请求体

请求体应直接接受 `writeback event`。

```json
{
  "event_id": "evt_20260313_0002",
  "event_type": "mark",
  "player_id": "player_local",
  "timestamp": "2026-03-13T17:03:00Z",
  "target": {
    "target_type": "poi",
    "target_id": "poi_teahouse_02",
    "slice_id": "slice_a"
  },
  "payload": {
    "mark_type": "warm_corner",
    "note": "适合雨天回来"
  },
  "visibility": "private",
  "source": {
    "client": "web",
    "surface": "poi_detail_panel",
    "version": "v0.1"
  },
  "context": {
    "current_zone_id": "zone_shibuya_core"
  }
}
```

### 响应体

建议返回：

```json
{
  "accepted": true,
  "event_record": {},
  "effects": {
    "player_effects": [],
    "place_effects": [],
    "world_effects": [],
    "state_snapshot": {},
    "world_feedback": {}
  },
  "persistence": {
    "saved": true,
    "scope": "slice_private",
    "storage_key": "slice_a:player_local"
  }
}
```

### 响应原则

- 必须能让前端立即刷新 UI
- 必须指出本次事件是否被接受
- 必须指出是否真正持久化成功
- 不应只返回自然语言提示

---

## 七、最小持久化建议

第一版不要求立刻上数据库。

可先使用文件级持久化保存：

- `player_state`
- `slice_state`
- `event_log`
- `place_marks`
- `recent_echoes`

建议逻辑上抽象成三类记录：

### 1. 事件记录 `event_record`

保存原始事件与处理结果摘要。

### 2. 玩家切片状态 `player_slice_state`

保存玩家在某个 `slice` 内的：

- `zone_familiarity`
- `poi_familiarity`
- `last_actions`
- `private_marks`
- `recent_echoes`

### 3. 切片公共状态 `slice_public_state`

第一版可只保留结构位，暂不大量开放写入。

---

## 八、与玩家状态系统的映射

本协议建议直接映射到 [`docs/PLAYER_STATE.md`](docs/PLAYER_STATE.md) 的三层结构。

### 即时状态层

优先受影响的字段：

- `action_state`
- `clarity`
- `tension`
- `attunement`
- `warmth`

### 世界关系层

优先受影响的字段：

- `zone_familiarity.<zone_id>`
- `poi_familiarity.<poi_id>`
- `route_familiarity.<route_id>`
- `left_messages_count`
- `memories_bound`
- `public_actions_taken`

### 长期人格 / 审美层

第一版不强制改动，但应预留未来接口，例如：

- `style_affinity.*`
- `archetype_tendencies.*`
- `home_style`

---

## 九、与 D3 / P3 / P4 的衔接

### 与 `D3` 的关系

`D3` 已经完成“玩家如何进入城市神话”的展示与叙事收束。

本协议负责把这些参与入口进一步转成可运行、可持久化的结构语义。

换句话说：

- `D3` 负责“你可以怎样进入故事”
- `Writeback Protocol` 负责“你进入后，故事如何记住你”

### 与 `P3` 的关系

`P3` 将在本协议基础上继续定义：

- `private / local_public / global` 的完整治理边界
- AI 改写、翻译、压缩与摘要规则
- moderation、审核、精选与晋升机制

### 与 `P4` 的关系

`P4` 将在本协议稳定后定义：

- `recent_echoes` 如何沉淀为 `archived_layers`
- 历史证据与可信度如何表示
- 同一地点如何叠加多时间层解释

---

## 十、v0.1 非目标

本协议第一版明确不解决以下问题：

- 完整多人并发冲突处理
- 完整社区审核与封禁流程
- 完整公共命名权机制
- 复杂任务链与阵营战争
- Time Folds 的全部历史深层规则
- 数据库选型与最终部署架构

这些能力都需要，但不应抢占 v0.1 的最小闭环目标。

---

## 十一、推荐的首个验收里程碑

### Persistent Slice v0.1

完成标准：

1. 玩家可在 Web 地图中选择一个 `poi` 或所在 `zone`
2. 玩家可执行 `observe / dwell / mark`
3. 行为通过 `POST /api/world/event` 提交
4. 后端返回统一 `effects` 结构
5. 至少一部分变化被持久化
6. 玩家重新进入同一 `slice` 时，仍可看到熟悉度、标记或回声存在

一旦这个里程碑成立，FableMap 就从“可交互地图原型”推进到“可持续世界原型”。

---

## 十二、后续扩展方向

在 v0.1 跑通后，建议按以下顺序扩展：

1. 把 `local_public` 打开到有限区域共创
2. 引入 `bind_memory`、`leave_echo`、`repair` 等新行为
3. 建立 AI 改写与治理边界
4. 让 `recent_echoes` 进入 `archived_layers`
5. 再开始 Time Folds / 历史深度的正式协议化

---

## 最终判断

FableMap 下一阶段最需要的，不是更多地图表现，而是一套能回答下面这个问题的统一协议：

> **玩家的一次行为，能不能成为世界历史的一部分？**

`WORLD_WRITEBACK_PROTOCOL v0.1` 的作用，就是先把这个问题从愿景变成结构。
# 世界编排器协议 v1.1

## 文档目的

本协议定义 FableMap 世界编排器的输入输出边界、失败降级策略、动态信号接入规范与前后端消费关系。

世界编排器是 AI-native 架构中的核心调度层，负责读取世界状态并生成“下一步世界反应”。

它服务的当前主线不是旧式地图主舞台，而是：

> **真实底图 -> 地点选择 -> 角色遭遇 / 地点事件 -> 聊天叙事 -> writeback / memory -> 回访反馈**

---

## 核心定位

世界编排器**不是**地图生成器，而是持续读取世界状态并生成结构化编排指令的系统。

### 职责

- 根据玩家行为重排地点优先级
- 触发角色遭遇、地点事件、广播与回声显影
- 结合动态信号调整世界气氛与事件概率
- 决定当前更应呈现哪个地点、角色或叙事钩子
- 判断哪些变化沉淀为私人记忆，哪些进入公共层
- 为聊天主舞台提供后续回应与推进建议

### 不负责

- 创造空间（由 Reality Kernel 负责）
- 替代真实底图或地点锚点（由 base map / place graph 负责）
- 直接生成最终视觉（由 Generative Surface 负责）
- 直接修改世界状态（只输出建议，由其他系统执行）

---

## 一、输入结构

### 1.1 完整输入定义

```python
class OrchestratorInput:
    # 世界状态
    world_state: WorldState
    slice_id: str

    # 玩家状态
    player_state: PlayerState
    player_id: str
    current_position: Coordinate
    active_place_id: Optional[str]
    active_character_id: Optional[str]
    active_event_id: Optional[str]
    active_dialogue_id: Optional[str]
    recent_actions: List[WritebackEvent]

    # 写回事件流
    writeback_events: List[WritebackEvent]

    # 动态信号
    dynamic_signals: DynamicSignals

    # 治理规则
    governance_rules: GovernanceRules
```

### 1.2 WorldState 结构

```python
class WorldState:
    world_id: str
    seed: str
    region: RegionInfo
    pois: List[POI]
    roads: List[Road]
    landmarks: List[Landmark]
    factions: List[Faction]
    historical_echoes: List[HistoricalEcho]
    memory_anchors: List[MemoryAnchor]
    state: Dict[str, Any]
```

说明：

- `roads / landmarks` 仍属于现实锚点的一部分
- 但当前编排消费重点不再是“如何画地图”，而是“如何在地点与叙事层生成下一步反应”

### 1.3 PlayerState 结构

以 [`PLAYER_STATE.md`](PLAYER_STATE.md) 为准，编排器重点读取：

```python
class PlayerState:
    player_id: str
    position: Position
    action_state: str
    focus_target_type: Optional[str]
    focus_target_id: Optional[str]
    active_place_id: Optional[str]
    active_character_id: Optional[str]
    active_event_id: Optional[str]
    active_dialogue_id: Optional[str]
    clarity: float
    tension: float
    attunement: float
    fatigue: float
    warmth: float
    zone_familiarity: Dict[str, int]
    poi_familiarity: Dict[str, int]
    character_bond: Dict[str, CharacterBond]
    faction_standing: Dict[str, FactionStanding]
    anchor_places: List[str]
    narrative_affinity: Dict[str, float]
```

### 1.4 DynamicSignals 结构

```python
class DynamicSignals:
    time_of_day: str
    day_of_week: str
    is_holiday: bool
    timestamp: datetime
    weather: Optional[str]
    temperature: Optional[float]
    traffic_level: Optional[float]
    crowd_density: Optional[float]
    signal_sources: Dict[str, str]
```

### 1.5 WritebackEvent 结构

以 [`WORLD_WRITEBACK_PROTOCOL.md`](WORLD_WRITEBACK_PROTOCOL.md) 为准，编排器重点读取：

```python
class WritebackEvent:
    event_id: str
    event_type: str
    player_id: str
    target_type: str
    target_id: str
    timestamp: datetime
    visibility: str
    payload: Dict[str, Any]
    context: Dict[str, Any]
```

---

## 二、输出结构

### 2.1 完整输出定义

```python
class OrchestratorOutput:
    place_suggestions: List[PlaceSuggestion]
    character_suggestions: List[CharacterSuggestion]
    event_suggestions: List[EventSuggestion]
    broadcast_suggestions: List[BroadcastSuggestion]
    echo_suggestions: List[EchoSuggestion]
    dialogue_followups: List[DialogueFollowup]
    callback_hooks: List[CallbackHook]
    observer_effect: Optional[ObserverEffect]
    orchestration_metadata: OrchestrationMetadata
    confidence_score: float
    fallback_triggered: bool
```

### 2.2 PlaceSuggestion 结构

```python
class PlaceSuggestion:
    place_id: str
    priority: int
    reason_tags: List[str]
    suggested_surface: str  # "map_pin" | "place_panel" | "chat_entry"
    highlight_mode: Optional[str]
    metadata: Dict[str, Any]
```

作用：

- 告诉前端当前哪些地点值得优先展示
- 允许真实底图只承担选点入口，而不是主叙事本体

### 2.3 CharacterSuggestion 结构

```python
class CharacterSuggestion:
    character_id: str
    related_place_id: Optional[str]
    priority: int
    tone: str
    reveal_mode: str  # "direct" | "hint" | "memory_echo"
    metadata: Dict[str, Any]
```

### 2.4 EventSuggestion 结构

```python
class EventSuggestion:
    event_id: str
    type: str
    target_type: str  # "poi" | "zone" | "character" | "global"
    target_id: str
    priority: int
    trigger_condition: Dict[str, Any]
    effect: Dict[str, Any]
    visibility: str
    ttl: Optional[int]
    metadata: Dict[str, Any]
```

### 2.5 DialogueFollowup 结构

```python
class DialogueFollowup:
    followup_id: str
    related_place_id: Optional[str]
    related_character_id: Optional[str]
    label: str
    tone: str
    trigger: Dict[str, Any]
```

作用：

- 为聊天主舞台提供下一句可接的话
- 为地点事件提供对话化收口

---

## 三、核心事件类型

编排器当前更应关注以下 6 种核心输出类型：

### 1. `place_reveal`

在某个地点显露新的可读层、可见线索或可进入入口。

### 2. `character_encounter`

触发地点相关角色出现、发声或被感知。

### 3. `place_event`

触发地点事件、局部异常、情绪变化或短期叙事节点。

### 4. `memory_echo`

唤起旧行为、旧对话、旧标记或历史痕迹。

### 5. `broadcast`

生成区域或全局播报，用于构建世界在持续回应的感觉。

### 6. `dialogue_push`

将当前状态推进到下一段聊天或下一条叙事回应。

---

## 四、前端消费口径

编排器输出应按以下优先级被消费：

1. 真实底图上的地点高亮与选点建议
2. 地点详情面板中的角色 / 事件入口
3. 聊天主舞台中的对话推进与语气建议
4. 写回结果后的回声、回访与世界反馈
5. 非阻塞型广播、scene capsule 或局部增强层

### 明确降级的旧口径

以下内容不再是当前编排器的主要消费目标：

- 围绕旧 [`frontend/src/WorldMap.jsx`](../frontend/src/WorldMap.jsx:1) 的自绘地图主舞台调度
- 为地图渲染层单独设计复杂主舞台行为
- 把编排器输出主要理解为“地图 UI 如何更丰富”

---

## 五、失败降级原则

当编排器失败、超时或置信度不足时：

1. 不得破坏真实底图选点能力
2. 不得阻塞地点详情与聊天入口
3. 不得阻塞 writeback 事件提交
4. 可以退回到确定性地点排序、默认事件模板与静态聊天入口

也就是说：

> 编排器负责提升体验密度，但不能成为地点进入、对话开始或记忆写回的单点故障。

---

## 六、与其他文档的关系

- [`ARCHITECTURE.md`](ARCHITECTURE.md) 定义当前主链路与系统分层
- [`PLAYER_STATE.md`](PLAYER_STATE.md) 定义玩家状态轴
- [`WORLD_WRITEBACK_PROTOCOL.md`](WORLD_WRITEBACK_PROTOCOL.md) 定义行为进入世界的方式
- [`WORLD_WRITEBACK_GOVERNANCE.md`](WORLD_WRITEBACK_GOVERNANCE.md) 定义治理边界

若与旧 Web-2D / 地图主舞台时期文档冲突，以当前主线文档为准。

---

## 七、结论

世界编排器当前应被理解为：

**一个读取地点、角色、事件、写回与记忆状态，并为“下一步该遇见谁、发生什么、聊到哪里”提供结构化建议的 AI-native 调度层。**

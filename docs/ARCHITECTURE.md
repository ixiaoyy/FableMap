# FableMap 系统架构

## 总体结构

FableMap v0.1 采用“四层式”架构：

1. **Geo Input Layer**：坐标输入与地理数据抓取
2. **Semantic Translation Layer**：OSM 标签解析与幻想语义映射
3. **World Memory Layer**：区域稳定标识、持久化与状态演进
4. **Presentation Layer**：将世界 JSON 交给 Godot 进行实例化

## 模块划分

### 1. Geo Input Layer

职责：

- 接收 `lat` / `lon` / `radius`
- 调用 Overpass API
- 清洗原始返回数据

建议实现：

- Python CLI
- `requests` 负责网络请求
- `pydantic` 负责数据建模

### 2. Semantic Translation Layer

职责：

- 解析 OSM 标签
- 计算区域特征（路网密度、建筑分布、主功能类型）
- 生成幻想世界字段

策略：

- 第一版以规则引擎为主
- 模板化描述为主，LLM 润色为辅
- 所有映射尽量可追踪、可解释

未来扩展：

- 加入黑色幽默文案模板层
- 支持成年人取向的社会讽刺映射规则
- 引入地区阶层感、组织气质和阵营色彩生成

### 3. World Memory Layer

职责：

- 使用空间索引生成稳定区域 key
- 本地持久化已生成的世界片段
- 保存地点状态和后续演化字段

第一版建议：

- 使用 `sqlite` 或本地 JSON 文件存储
- 后续可升级为图数据库与向量检索

未来扩展：

- 保存阵营影响、区域控制力和经济状态
- 保存历史回声、谜团进度和动态事件痕迹

### 4. World Simulation Layer（Future）

职责：

- 维护阵营、资源流、地区价值和社会扰动
- 将外部动态信号转成可解释的世界状态变化
- 为 NPC 行为、任务传播和地区冲突提供状态输入

候选输入：

- 房价 / 消费水平
- 人流 / 拥堵
- 营业状态 / 时间段
- 天气 / 节假日

### 5. Presentation Layer

职责：

- 读取世界 JSON
- 将 POI 与区域映射为 Godot 预制体
- 提供移动、点击与描述展示

第一版建议：

- Godot 4
- 少量预制体验证完整链路
- 先使用占位体，不追求高保真美术

## 数据流

1. 用户输入坐标
2. 拉取 OSM 数据
3. 生成标准化中间结构
4. 计算区域特征
5. 生成幻想世界 JSON
6. 查询世界记忆并合并已有状态
7. （未来）叠加阵营、历史与动态扰动模拟结果
8. 输出给 CLI / 文件 / Godot
9. 玩家交互后回写世界状态

## 目录建议

- `docs/`：设计与产品文档
- `tools/geo_parser/`：坐标输入、Overpass 请求、OSM 解析
- `tools/world_builder/`：幻想语义映射与文本生成
- `tools/memory/`：区域 key 与持久化层
- `tools/simulation/`：阵营、经济、历史与动态扰动模型
- `godot/`：场景加载、实例化、交互
- `examples/`：示例坐标与输出 JSON

## 设计原则

### 稳定优先

地理语义必须先稳定，再谈华丽生成。

### Schema 优先

Godot 不直接消费 OSM 数据，只消费统一的世界描述协议。

### 可扩展优先

区域规则、POI 模板和视觉预制体都应支持后续独立扩展。
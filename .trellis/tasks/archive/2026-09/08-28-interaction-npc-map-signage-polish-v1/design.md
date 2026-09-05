# 交互、NPC、地图入口与看板精细化 v1：设计

## Interaction language

- 统一层级：靠近可见 → hover/触摸强化 → 点击执行 → modal/反馈确认。
- 装饰不显示动作词；可交互对象使用具体动词：交谈、进入、查看、休息、购买。
- 不用永久浮标覆盖地图；提示属于临时信息，不成为景观元素。

## NPC presentation

- GameSession runtime 继续拥有玩法坐标；client 只处理 body-local facing/step/label/feedback。
- walking 使用方向翻转/步态，waiting 停步，activity 保留职业标记，hit 后恢复最新 runtime 姿态。
- relationship feedback 只由首次 talk snapshot 变化触发，不新增第二套好感状态。

## Map and signage

- Tiled 继续拥有交互点/坐标；如提示缺 owner，优先扩现有 typed definition，不按 object name 猜行为。
- 私人内屋“暂不可参观”与可进入外门形成明确对比。
- 看板文案只描述已实现信息，不承诺未开放商店、任务或职业能力。

## Responsive/accessibility

- hover 是增强，不是唯一入口；触摸依赖接近范围和可点击 hit area。
- 提示/按钮保持焦点可见，不被 daylight overlay 覆盖，200% zoom 不裁切。

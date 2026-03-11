# 模块认领说明

- 模块名 / 区域名：情绪胶囊、私密留言与地点记忆回声 C2
- 负责人：Cascade
- 改动类型：功能
- 当前状态：in_progress

## 目标

1. **历史回声叠加层**：`historical_echoes[]` 每条回声关联到其 landmark，
   在地标 SVG 节点旁渲染半透明悬浮文字引局（SVG `<text>` + fade 动画）
2. **情绪胶囊标记**：`state.private_marks[]` 目前为空；在 `world_builder`
   从 POI `emotion_hook` 派生示例胶囊数据（每个 secret_slot POI 生成一条），
   在地图上渲染为小型留言泡泡形状（SVG path）
3. **地标 detail-card 扩展**：补充回声摘要一行，让地标详情面板有历史深度

## 计划修改范围

- `fablemap/world_builder.py`：`_build_private_marks(pois)` 新函数 + `state.private_marks` 填充
- `fablemap/bundle.py`：`_echo_layer_svg` + `_capsule_marks_svg` 两个辅助函数；
  地标 detail_body 补充回声摘要；SVG 调用插入；CSS；i18n

## 明确不改范围

- 不修改 Schema、协议文档
- 不改现有 W3/V1/V2/V3/C1 逻辑
- 不引入第三方库

## 依据文档

- `docs/AI_SHARED_TASKLIST.md`（任务 C2）
- `docs/DISTURBANCE_MODEL.md`（`state.poi_states` 局部扰动切片）
- `docs/AI参与开发协议.md`

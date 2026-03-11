# 变更说明：D2 · 像素角色行走与街道通行抽象

## 变更类型
- [x] 新功能 (New Feature)
- [ ] 协议更新 (Protocol Update)
- [ ] 修复 (Bug Fix)
- [ ] 文档 (Documentation)

## 变更详情
1. **玩家实体 (Player Entity)**：
    - 在地图主舞台添加了玩家图标（SVG 元素）。
    - 初始位置自动落在生成区域的中心点。
2. **行走逻辑 (Movement Logic)**：
    - 支持 WASD 和方向键控制玩家移动。
    - 实现了平滑的坐标转换与渲染更新。
3. **街道通行抽象 (Street Traversal Abstraction)**：
    - 引入了基于 `roads` 骨架的通行限制。
    - 玩家在移动时会自动检测是否靠近街道，若远离街道则会受到阻挡。
    - 支持沿坐标轴的滑动处理（Sliding），提升在街道转角处的移动体验。
4. **相机跟随 (Camera Follow)**：
    - 地图相机（ViewBox）会自动随玩家移动，保持玩家在视口中心。
    - 调整了地图边缘的限制（Relaxed Clamping），允许玩家在生成区域边缘进行一定程度的探索。
5. **UI 更新**：
    - 侧边栏新增“玩家状态”面板，实时显示坐标与行动状态（驻足/跋涉中）。

## 验证情况
- 已通过 `python -m fablemap.demo` 生成样例世界。
- 在 `bundle/index.html` 预览页中通过键盘控制测试了行走与街道碰撞逻辑。
- 确认相机跟随功能正常。

## 相关任务
- 引用自 `docs/AI_SHARED_TASKLIST.md` 中的 `D2`。

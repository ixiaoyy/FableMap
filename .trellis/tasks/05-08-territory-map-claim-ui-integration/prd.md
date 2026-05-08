# Territory Map Claim System - UI Integration & Finalization

## 背景
领地系统（Territory System）的前端视觉 UI（`TerritoryManagementDashboard`）已经完成了二次元/轻科幻风格的设计重构，目前挂载在临时的 `/territory` 路由下供预览。后端的 API 和数据库层以及前端的 `territoryService.js` 也已经就绪。

本任务旨在将纯视觉的 UI 面板与真实的 API 进行联调，并将面板整合进系统的核心主干路径中，最后补充必要的自动化测试。

## 待办任务清单

1. **前后端数据联调 (Data Integration)**:
   - 移除 `frontend/app/routes/territory.tsx` 中的 mock 数据。
   - 接入 `frontend/app/lib/territoryService.js` 中的 `getTerritory`、`claimTerritory` 等真实 API。
   - 实现点击“立即申领”后的领地创建逻辑。
   
2. **系统主路由整合 (Route Integration)**:
   - 评估并将 `/territory` 路由重定向或整合入店主后台 `/owner`。
   - 确保店长登录后能无缝看到“领地管理”作为其工作流的一环。

3. **大地图可视化集成 (Map Visualization)**:
   - 完善 `frontend/app/product/WorldMap.jsx`。
   - 使用 `MapAdapter.js` 读取领地列表数据，在 Leaflet/高德地图 上绘制出对应领地类型的半透明圆形遮罩。

4. **遗留的数据库工作**:
   - 补充完善 SQLAlchemy 针对 `territories` 表的数据库迁移脚本。

5. **质量保证 (QA & Tests)**:
   - 针对领地申领系统的防碰撞算法与后端路由补充 Python 单元测试。
   - 针对前端 `territoryService.js` 补充基础单测。

## 继承自
父任务: `05-07-05-07-territory-map-claim-system`

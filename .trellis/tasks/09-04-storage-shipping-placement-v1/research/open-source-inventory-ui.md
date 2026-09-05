# Open-source inventory interaction evaluation

核对日期：2026-09-04。当前项目为 Vue 3.5.41 + TypeScript 6；所有持久变更必须通过 `dispatchLocalGameCommand()` 进入 GameSession，组件不能直接重排 gameplay 数组。

## Candidates

- [SortableJS 1.15.7](https://github.com/SortableJS/Sortable/releases/tag/1.15.7)：MIT、无运行时依赖、支持触摸；发布的 minified 文件约 45 KB，TypeScript 另需 types。键盘与无障碍拖放仍是公开未解决问题，不提供本任务必需的等价入口。
- [vue.draggable.next / vuedraggable 4.1.0](https://github.com/SortableJS/vue.draggable.next)：MIT、Vue 3 可用，但最后发布于 2021-08-22，固定依赖 SortableJS 1.14.0，以同步改写 `v-model` 数组为核心，也没有内置键盘拖放。
- [FormKit Drag and Drop 0.6.1](https://github.com/formkit/drag-and-drop)：MIT、约 4 KB gzip、支持 Vue/TypeScript 与触摸；核心仍以数据数组改写为中心，无障碍示例需要自行实现键盘逻辑并直接 splice 响应式数组。
- [Atlassian Pragmatic Drag and Drop 3.1.0](https://github.com/atlassian/pragmatic-drag-and-drop)：Apache-2.0、核心约 4.7 KB、框架无关并由调用方决定状态写入，是最接近 typed command 边界的候选；但仍不自动提供键盘无障碍，需要自建等价交互。

## Decision

v1 不增加依赖。槽位交换、堆叠、拆分、容器转移与出货不是普通列表排序，通用拖拽库不能拥有状态，并会增加 Vue 临时数组与 GameSession snapshot 的同步/回滚风险。

表现层使用标准 [Pointer Events](https://www.w3.org/TR/pointerevents3/)统一鼠标、触摸与笔；同时提供点击/轻触选中后点击目标槽，以及方向键、`Space`、`Enter`、`Escape` 与 `aria-live`。所有入口只派发同一 typed command。该方案也满足 [WCAG 2.5.7 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements) 对非拖动替代操作的要求。

若实际实现证明拖动预览或自动滚动超出薄表现层，再单独评审并锁定 Pragmatic Drag and Drop；本任务不预装备用依赖。

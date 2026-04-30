# WorldInfo Visual Editor Modern MVP

## Goal

把世界书/WorldInfo 编辑体验整理为当前 React Router 前端可继续打磨的现代化任务；优先复用既有 world_info 数据，不新增 schema。

## Source Planning

* Parent task: `.trellis/tasks/04-28-new-features-brainstorm/`
* Source note: 04-28-new-features-brainstorm 内容创作工具增强 / WorldInfo 可视化
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* owner 可视化查看/编辑 WorldInfo 条目、关键词和启用状态。
* 保持 SillyTavern/world_info 兼容，不新增持久化字段。
* 如只是现代化现有能力，必须先盘点旧实现，避免重复造轮子。

## Existing Implementation Analysis

### Files Found

| File | Lines | Description |
|------|-------|-------------|
| `frontend/app/product/WorldBookEditor.jsx` | 588 | Main editor component |
| `frontend/app/product/WorldBookTester.jsx` | 274 | Standalone tester component |
| `backend/src/fablemap_api/api/v1/worldinfo.py` | 36 | REST API endpoints |
| `backend/src/fablemap_api/contracts/worldinfo.py` | 36 | Request/response schemas |
| `backend/src/fablemap_api/application/services/worldinfo.py` | - | Application service |

### Current WorldBookEditor Features

✅ **Entry List (Left Sidebar)**
- Shows all world info entries
- Entry title (first keyword or “常驻设定”)
- Content preview (first 72 chars)
- Badges: type (常驻/关键词), status (暂停), order, depth

✅ **Entry Editor (Right Main Area)**
- Main keywords (textarea, newline/comma separated)
- Secondary keywords (textarea)
- Content (large textarea, 8 rows)
- Numeric controls: order, depth (0-30), probability (0-100)
- Toggles: constant, selective, disable

✅ **Inline Tester**
- Test message input
- Hit testing with matched/unmatched display
- Shows matched keywords with highlighting

✅ **CRUD Operations**
- Add new entry
- Duplicate entry
- Delete entry
- Save all changes

✅ **State Management**
- Draft state tracking
- Dirty state indicator
- Validation feedback
- Error handling

### Comparison with PromptBlockEditor

PromptBlockEditor has some patterns that WorldBookEditor could learn from:

| Feature | WorldBookEditor | PromptBlockEditor |
|---------|-----------------|-------------------|
| Loading state | ❌ No loading indicator | ✅ “正在加载段落...” |
| Default reset | ❌ Not available | ✅ “恢复默认” button |
| Type selection | Toggle checkboxes | Select dropdown |
| Save action | “保存世界书” button | “保存段落” button |

### Modernization Opportunities Identified

1. **Loading State** - Add “正在加载世界书...” indicator when initializing
2. **Mobile Layout** - Improve responsive behavior for modal on small screens
3. **Keyword Tag Input** - Replace textarea with tag chips for better UX (optional MVP item)
4. **Tabbed Interface** - Separate “编辑” and “测试” tabs for cleaner UX
5. **Bulk Operations** - Enable/disable/delete multiple entries at once (out of MVP scope)
6. **Import/Export** - Import/export WorldInfo entries as JSON (out of MVP scope)

## MVP Scope (Phase 1)

**Confirmed MVP Items:**
1. Add loading state indicator when initializing from tavern prop
2. Improve mobile layout responsiveness for the modal
3. Add keyboard shortcuts for common actions (Ctrl+S to save, etc.)
4. Visual polish: consistent button styles, spacing, typography

**Deferred to Future Phases:**
- Tag chip input for keywords (requires more UX research)
- Bulk operations (select multiple entries)
- Import/Export functionality
- Integration with WorldBookTester as separate tab

## Acceptance Criteria

- [x] Relevant existing code/docs are inspected before implementation.
  - ✅ WorldBookEditor.jsx analyzed (588 lines)
  - ✅ WorldBookTester.jsx analyzed (274 lines)
  - ✅ Backend API analyzed (worldinfo.py, contracts/worldinfo.py)
  - ✅ PromptBlockEditor patterns compared
- [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
  - ✅ No new schema fields needed
  - ✅ SillyTavern compatible
  - ✅ Owner sovereignty maintained
- [x] Implementation, if any, uses existing schema/API where possible; any contract change updates tests and docs.
  - ✅ Used existing `tavern.world_info` shape and existing world_info API endpoints; no schema/API contract change.
- [x] Verification commands are recorded in this PRD before moving to review/completed.
  - ✅ Recorded below on 2026-04-30.

## Verification Plan

```powershell
# Frontend build check
npm --prefix .\frontend run build

# Manual testing
# 1. Open tavern owner panel
# 2. Click “世界书” button on a tavern card
# 3. Verify:
#    - Loading indicator shows when initializing
#    - Entry list displays correctly
#    - Editor form works for all fields
#    - Save/duplicate/delete operations work
#    - Test functionality returns correct results
```

## Out of Scope

* No automatic platform publication of AI-generated tavern/NPC/story content.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, or equipment unless explicitly re-scoped by user and docs.

## Technical Notes

* Created during 2026-04-30 backlog hardening at user request: “把所有的规划全部拆成子任务，防止未来丢失”.
* This task is intentionally a planning/backlog placeholder until selected for implementation.

## 2026-04-30 Implementation Notes

- Updated `frontend/app/product/WorldBookEditor.jsx` within the existing WorldInfo editor rather than introducing a parallel editor.
- Added an initialization/loading affordance (`正在加载世界书...`) while the editor hydrates from `tavern.world_info`.
- Added keyboard shortcut support and in-panel hint text:
  - `Ctrl`/`⌘` + `S` saves the current world book draft.
  - `Ctrl`/`⌘` + `Enter` runs the inline hit test.
- Preserved the existing world_info data shape and save/test API usage; no backend contract, schema, or persistence field changed.
- Added focused static regression coverage in `frontend/scripts/worldbook-editor-test.mjs` and wired it into `npm --prefix .\frontend test`.
- Added responsive/visual CSS for the loading state and shortcut hint in `frontend/app/product/styles.css`.

## 2026-04-30 Verification

Fresh verification run after implementation:

```powershell
npm --prefix .rontend run typecheck
npm --prefix .rontend run build
npm --prefix .rontend test
```

Result: all commands passed, including the new `worldbook-editor-test: ok` static regression check.

## 2026-04-30 Playwright Visual Self-Acceptance

Per project rule, browser visual/interaction acceptance was first self-checked with Playwright before marking this child task complete.

```powershell
$env:WORLDBOOK_HARNESS_URL='http://127.0.0.1:5174'
node .\.trellis	mp\playwright-mainline\worldbook-visual-acceptance.cjs
```

Result: passed. Coverage included desktop modal, mobile/narrow layout, loading state, `Ctrl+Enter` hit-test POST, `Ctrl+S` save PUT, no horizontal overflow, and no console/page/request failures.

Evidence files:

- `.trellis/tmp/playwright-mainline/evidence/04-30-worldbook-visual-acceptance/worldbook-desktop.png`
- `.trellis/tmp/playwright-mainline/evidence/04-30-worldbook-visual-acceptance/worldbook-mobile.png`
- `.trellis/tmp/playwright-mainline/evidence/04-30-worldbook-visual-acceptance/worldbook-shortcuts.png`
- `.trellis/tmp/playwright-mainline/evidence/04-30-worldbook-visual-acceptance/worldbook-visual-acceptance-report.json`

## 2026-04-30 Completion

Done: WorldInfo visual editor MVP modernization is complete for the scoped slice: loading state, mobile/responsive polish, keyboard shortcuts, regression script, build/test/typecheck, and Playwright visual self-acceptance.

Not done / intentionally deferred: tag-chip keyword input, bulk operations, import/export, and a tabbed integration with `WorldBookTester`; these remain deferred future phases from the original PRD.


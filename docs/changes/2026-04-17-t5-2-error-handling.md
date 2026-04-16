# T5.2 变更记录：错误处理 — 角色卡解析防御性增强

## 变更日期
2026-04-17

## 任务 ID
T5.2

## 变更类型
缺陷修复

## 概述
`parseCharacterCard` 函数对 `character_book.entries` 异常结构增加防御性处理，当 entries 为非数组值（字符串、对象等）时不会抛 TypeError，而是优雅降级为空 world_info。

## 为什么改
`parseCharacterCard` 的 world_info 解析使用 `(data.character_book?.entries || []).map(...)`：

```javascript
// 原代码 — 若 entries 是字符串或非数组对象，.map() 抛 TypeError
world_info: (data.character_book?.entries || []).map((entry) => ({ ... }))
```

如果 SillyTavern 角色卡中 `character_book.entries` 是非数组的真值（如字符串 `"foo"` 或对象 `{a:1}`），则 `"foo" || []` 返回 `"foo"`，`"foo".map()` 抛出 `TypeError: "foo".map is not a function`，导致整个角色卡导入失败。

## 改了什么
**文件：`frontend/src/services/tavernService.js`**

`parseCharacterCard` 中 world_info 解析逻辑替换为 IIFE + try/catch + `Array.isArray()` 校验：

```javascript
world_info: (() => {
  try {
    const entries = data.character_book?.entries
    if (!Array.isArray(entries)) return []
    return entries.map((entry) => ({ ... }))
  } catch {
    return []
  }
})(),
```

## 没改什么
- `extractCharacterCardFromPng` 未修改（已有完整的 try/catch）
- `TavernCreatePanel.handleImportCard` 未修改（已有 try/catch 调用方保护）
- 后端未修改

## 影响文件
| 文件 | 改动类型 |
|------|----------|
| `frontend/src/services/tavernService.js` | 缺陷修复 |
| `docs/CURRENT_TASKS.md` | 状态同步 |

## 验证
- `npm run build` 在 `frontend/` 执行成功（73 modules, 315.30 kB）

## 风险点
无 — 修复仅添加防御性降级，不改变正常情况行为

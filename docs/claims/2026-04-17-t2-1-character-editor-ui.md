# T2.1 任务认领：角色卡编辑器 UI

## 任务 ID
T2.1

## 任务名称
角色卡编辑器 UI

## 认领时间
2026-04-17

## 负责人
Codex

## 改动类型
前后端功能补齐

## 任务目标
补全角色卡编辑闭环：

1. 创建空间时可编辑导入/手动新增的角色卡字段。
2. 店主控制台可对已有空间新增、编辑、删除角色。
3. 角色卡支持 `avatar` 与标准表情 `sprites` 配置。
4. 后端新增、更新与整表角色更新时都能持久化头像和表情立绘。

## 可修改范围
- `frontend/src/CharacterEditor.jsx`
- `frontend/src/CharacterManagementModal.jsx`
- `frontend/src/TavernCreatePanel.jsx`
- `frontend/src/TavernOwnerPanel.jsx`
- `frontend/src/services/tavernService.js`
- `frontend/src/styles.css`
- `fablemap/tavern.py`
- `tests/test_tavern_character_editor.py`
- `docs/CURRENT_TASKS.md`
- `docs/changes/2026-04-17-t2-1-character-editor-ui.md`

## 明确不改范围
- 不改角色聊天 Prompt 构建策略。
- 不新增前端依赖。
- 不接管并行 T4/T5 已完成改动。

## 验证方式
- `npm run build`
- `py -3 -m pytest tests/test_tavern_character_editor.py tests/test_tavern_llm_degradation.py tests/test_tavern_discovery.py tests/test_tavern_token_usage.py -q`
- `git diff --check`

## 当前状态
done

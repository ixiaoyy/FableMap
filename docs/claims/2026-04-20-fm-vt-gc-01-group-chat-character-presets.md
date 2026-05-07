# FM-VT-GC-01 任务认领：群聊模式与系统预设角色

## 任务 ID
FM-VT-GC-01

## 任务名称
群聊模式 MVP 与系统预设角色外观

## 认领时间
2026-04-20

## 负责人
Codex

## 改动类型
前后端功能切片

## 任务目标
把空间从单角色对话扩展到可配置的轻量群聊模式，并补齐系统预设角色的开箱即用体验：

1. 店主可以在空间管理里开启 / 关闭群聊模式，并配置群聊策略与每轮最大回复数。
2. 每个角色可配置群聊发言积极度，后端统一规范到 `0.0` 到 `1.0`。
3. 访客进入空间后，若群聊开启，可向所有角色发送消息，由群聊选择器决定接话角色。
4. 系统预设角色可直接加入空间，并带默认角色卡字段、外观预设与发言积极度。
5. 角色头像、角色列表、聊天栏和角色详情能展示外观预设摘要，缺少图片时仍有稳定占位头像。

## 可修改范围
- `fablemap/group_chat.py`
- `fablemap/tavern.py`
- `fablemap/web/router.py`
- `fablemap/web/service.py`
- `frontend/src/CharacterEditor.jsx`
- `frontend/src/CharacterManagementModal.jsx`
- `frontend/src/OwnerConsoleSections.jsx`
- `frontend/src/TavernChatRoom.jsx`
- `frontend/src/TavernCreatePanel.jsx`
- `frontend/src/TavernGroupSettingsModal.jsx`
- `frontend/src/TavernOwnerPanel.jsx`
- `frontend/src/services/tavernService.js`
- `frontend/src/styles.css`
- `frontend/src/CharacterAvatar.jsx`
- `frontend/src/CharacterLookSummary.jsx`
- `frontend/src/SystemCharacterPresetPicker.jsx`
- `frontend/src/characterLooks.js`
- `frontend/src/systemCharacterPresets.js`
- `tests/test_group_chat.py`
- `tests/test_tavern_character_editor.py`
- `docs/claims/2026-04-20-fm-vt-gc-01-group-chat-character-presets.md`
- 后续完成记录：`docs/changes/2026-04-20-fm-vt-gc-01-group-chat-character-presets.md`

## 明确不改范围
- 不做访客间实时社交、多人在线同步或聊天室成员身份系统。
- 不改平台 Token 计费、API Key 存储或 LLM 后端选择策略。
- 不引入新的前端依赖或图片生成流程。
- 不重写现有单角色聊天链路；群聊必须作为可关闭的增量模式。
- 不改变世界书、记忆、输出护栏和 Prompt Block 的既有协议边界。

## 依据的协议文档
- `docs/AI参与开发协议.md`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/CURRENT_TASKS.md`
- `docs/ARCHITECTURE.md`
- `docs/WHAT_NOT_TO_BUILD.md`

## 预期产出
- 群聊核心选择器支持安全的发言积极度与每轮回复上限。
- 空间数据模型可保存 `group_chat_enabled`、`group_chat_config` 和角色 `talkativeness`。
- 店主控制台新增群聊设置入口与配置弹窗。
- 聊天房间在群聊开启时创建临时群聊会话，并按成员响应返回多条角色消息。
- 系统预设角色 picker 可用于开店向导与角色管理，角色外观在 UI 中可见可编辑。
- 覆盖群聊选择器 / API 与角色外观持久化的回归测试。

## 验证方式
- `npm --prefix .\frontend run build`
- `py -3 -m pytest tests/test_group_chat.py tests/test_tavern_character_editor.py -q`
- `py -3 -m compileall -q fablemap`

## 当前状态
done

## 当前工作区说明
认领时工作区已经存在群聊、角色外观和系统预设角色相关的未提交改动。本认领用于约束后续收口范围，后续 change 记录只描述最终验证通过的真实结果。

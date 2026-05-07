# 2026-04-20 - FM-VT-GC-01 群聊模式与系统预设角色

为空间补齐轻量群聊模式 MVP，并把系统预设角色接入开店向导、角色管理和角色外观展示。

## 范围

| 文件 | 说明 |
|------|------|
| `fablemap/group_chat.py` | 群聊成员字段归一化；支持策略校验、每轮回复上限和沉默角色跳过 |
| `fablemap/tavern.py` | 空间保存群聊开关 / 配置；角色保存外观和群聊发言积极度 |
| `fablemap/web/router.py` | 临时群聊会话 API 返回策略与回复上限，并按配置选择说话角色 |
| `frontend/src/TavernGroupSettingsModal.jsx` | 新增店主群聊设置弹窗 |
| `frontend/src/TavernOwnerPanel.jsx` | 店主空间卡片和高级工具台新增群聊入口与状态 |
| `frontend/src/TavernChatRoom.jsx` | 聊天页按空间配置切换单聊 / 群聊模式 |
| `frontend/src/CharacterEditor.jsx` | 角色编辑器新增外观预设和发言积极度 |
| `frontend/src/SystemCharacterPresetPicker.jsx` | 系统预设角色选择器，用于开店向导与角色管理 |
| `frontend/src/CharacterAvatar.jsx` | 统一角色头像渲染，支持外观效果与占位头像 |
| `frontend/src/CharacterLookSummary.jsx` | 统一外观摘要展示 |
| `frontend/src/characterLooks.js` | 内置外观预设与外观归一化工具 |
| `frontend/src/systemCharacterPresets.js` | 内置系统角色预设、外观与发言积极度 |
| `frontend/src/services/tavernService.js` | 新增群聊 API 封装，并保留角色外观 / 发言积极度解析 |
| `frontend/src/styles.css` | 群聊设置、系统预设角色、角色外观和头像效果样式 |
| `tests/test_group_chat.py` | 群聊选择器、API 和空间群聊配置回归测试 |
| `tests/test_tavern_character_editor.py` | 角色外观与发言积极度持久化测试 |
| `docs/claims/2026-04-20-fm-vt-gc-01-group-chat-character-presets.md` | 本任务认领说明 |

## 行为

- 店主可在空间管理或高级工具台打开群聊设置。
- 群聊设置可保存启用状态、回应策略、每轮最大回应数、回应间隔和是否保留角色名提示。
- 每个角色可设置 `talkativeness`，后端和群聊选择器都会裁剪到 `0.0` 到 `1.0`。
- `talkativeness = 0` 的角色不会被群聊选择器主动选中。
- 无效群聊策略会回退到 `balanced`，每轮最大回应数限制在 `1` 到 `3`。
- 访客进入已开启群聊且至少有两个角色的空间时，聊天页切换为群聊模式。
- 群聊模式会先创建临时群聊会话，再由选择器决定本轮接话角色。
- 系统预设角色可直接加入空间，并带角色卡文本、外观预设和发言积极度。
- 角色编辑器可调整外观预设、外观备注、衣橱方案和群聊发言积极度。
- 角色头像在没有图片 URL 时使用外观预设生成稳定占位样式。

## 验证

- `npm --prefix .\frontend run build`
- `py -3 -m pytest tests/test_group_chat.py tests/test_tavern_character_editor.py -q`
- `py -3 -m compileall -q fablemap`
- `git diff --check`

## 备注

`npm --prefix .\frontend run build` 仍报告既有 Vite 提示：`tavernService.js` 同时被静态和动态 import，构建成功，不影响本切片。

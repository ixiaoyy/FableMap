# 2026-04-20 - FM-VT-GC-09 店主群聊配置界面

## 为什么改

GC-06 / GC-07 已提供空间级群聊配置 API，GC-08 已把访客聊天房间接入持久群聊；但店主还缺少可视化配置入口，无法在控制台调整群聊开关、角色接话积极度和发言策略。

## 改了什么

| 文件 | 说明 |
|------|------|
| `frontend/src/TavernGroupSettingsModal.jsx` | 群聊设置弹窗读取最新配置，保存时调用 `updateGroupChatConfig()`，支持开关、策略、每轮回应、回应间隔、角色名提示和角色 `talkativeness` 滑块 |
| `frontend/src/styles.css` | 增加群聊设置提示、空状态和保存成功样式 |
| `.gitignore` | 忽略本地 pytest 临时目录，避免失败重试生成的不可访问临时目录污染 `git status` |
| `docs/AI_SHARED_TASKLIST.md` | 将 FM-VT-GC-09 标记为完成，并记录实现范围 |
| `docs/CURRENT_TASKS.md` | 同步 Phase 11 群聊任务状态 |
| `docs/claims/2026-04-20-fm-vt-gc-09-owner-group-chat-settings.md` | 新增本次任务认领说明 |

## 行为变化

- 店主可从空间卡片或高级工具台点击“群聊”打开设置。
- 弹窗打开后会读取 `/api/taverns/{id}/group-chat` 的最新配置。
- 保存时走 `/api/taverns/{id}/group-chat/config`，只提交 `group_chat_enabled`、`group_chat_config` 和 `character_talkativeness`。
- 角色滑块会同步到角色的 `talkativeness`，访客侧群聊发言选择立即使用新数值。
- 角色不足时 UI 会提示至少需要补充角色后再开启群聊。

## 没改什么

- 未新增后端字段。
- 未改变 `GroupChatManager` 的选择策略实现。
- 未修改访客侧群聊消息流和历史展示。
- 未补 GC-10 的完整 LLM / 权限边界测试矩阵。

## 验证

- 已通过：`npm --prefix .\frontend run build`
- 已通过：`& 'C:\Users\phpxi\miniconda3\python.exe' -m pytest -q --tb=short -p no:cacheprovider --basetemp .\tmp_pytest_escalated_gc09 tests/test_group_chat.py`
- 已通过：`git -c safe.directory=D:/work/ai- diff --check`

## 风险

- 群聊配置弹窗依赖 GC-06 / GC-07 的空间级配置 API；如果后端未同步该接口，保存会显示 API 错误。
- 后端当前只返回角色配置摘要，前端会将摘要合并回已有角色对象，避免覆盖角色卡长字段。

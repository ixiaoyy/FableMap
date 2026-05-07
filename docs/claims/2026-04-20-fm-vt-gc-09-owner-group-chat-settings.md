# FM-VT-GC-09 任务认领：店主群聊配置界面

## 任务 ID

FM-VT-GC-09

## 任务名称

店主群聊配置界面

## 认领时间

2026-04-20

## 负责人

Codex

## 改动类型

前端经营配置切片

## 任务目标

让店主可以在控制台直接配置空间群聊能力：

1. 开启 / 关闭空间群聊模式。
2. 选择发言策略：均衡轮换、按积极度抽取、固定轮流、减少重复发言。
3. 调整每轮最多回应、回应间隔和角色名提示。
4. 用滑块配置每个角色的 `talkativeness`。

## 可修改范围

- `frontend/src/TavernGroupSettingsModal.jsx`
- `frontend/src/TavernOwnerPanel.jsx`
- `frontend/src/OwnerConsoleSections.jsx`
- `frontend/src/styles.css`
- `.gitignore`（仅补本地测试临时目录忽略项）
- `docs/AI_SHARED_TASKLIST.md`
- `docs/CURRENT_TASKS.md`
- `docs/claims/2026-04-20-fm-vt-gc-09-owner-group-chat-settings.md`
- `docs/changes/2026-04-20-fm-vt-gc-09-owner-group-chat-settings.md`

## 明确不改范围

- 不新增后端 schema 字段。
- 不改变群聊发言选择算法。
- 不改访客侧 `TavernChatRoom` 群聊消息流。
- 不补 GC-10 的完整测试矩阵。

## 依据的协议文档

- `docs/AI参与开发协议.md`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/CURRENT_TASKS.md`
- `docs/claims/2026-04-20-fm-vt-gc-07-frontend-group-chat-api.md`
- `docs/claims/2026-04-20-fm-vt-gc-08-tavern-group-chat-room.md`

## 预期产出

- 店主控制台可打开群聊设置弹窗。
- 弹窗展示群聊开关、策略卡和角色 `talkativeness` 滑块。
- 保存走空间级群聊配置 API，不在前端手写 URL。
- 同步共享任务清单和变更记录。

## 验证方式

- `npm --prefix .\frontend run build`
- `& 'C:\Users\phpxi\miniconda3\python.exe' -m pytest -q --tb=short -p no:cacheprovider --basetemp .\tmp_pytest_escalated_gc09 tests/test_group_chat.py`
- `git -c safe.directory=D:/work/ai- diff --check`

## 当前状态

done

# 2026-04-20 新人一键试玩入口

## 变更摘要

- 首屏新增 `⚡ 立即试玩`，可直接进入内置公益新手空间。
- 首次使用弹窗新增“30 秒可体验”卡片：
  - 未填写昵称时自动生成临时访客称呼。
  - 不要求定位权限。
  - 不要求店主先配置 API Key。
- 空间发现页新增“新手直达”提示与空态按钮：
  - 附近没有空间或筛选无结果时，仍可先体验聊天闭环。
  - 入口指向 `pw_lantern_helpdesk`，若该 ID 不可用，会回退搜索公开营业的公益空间。
- 一键试玩成功后会正常调用 `enter_tavern`，因此仍会记录访客回访状态与后续聊天记忆。

## 关键文件

- `frontend/src/App.jsx`
- `frontend/src/FirstRunModeModal.jsx`
- `frontend/src/WorldStagePanel.jsx`
- `frontend/src/WorldStageTavernDiscoveryLane.jsx`
- `frontend/src/styles.css`

## 验证

- `npm --prefix .\frontend run build`
- `npm --prefix .\frontend test`
- `& 'C:\Users\phpxi\miniconda3\python.exe' -m pytest -q --tb=short -p no:cacheprovider --basetemp .\artifacts\pytest-basetemp-current-escalated tests/test_group_chat.py`
- `& 'C:\Users\phpxi\miniconda3\python.exe' -m pytest -q --tb=short -p no:cacheprovider --basetemp .\artifacts\pytest-basetemp-current-escalated tests/test_default_public_welfare_taverns.py`


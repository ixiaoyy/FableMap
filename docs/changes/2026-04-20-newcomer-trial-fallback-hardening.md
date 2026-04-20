# 2026-04-20 新人试玩入口回退加固

## 变更摘要

- 将新人一键试玩的酒馆解析逻辑从 `App.jsx` 抽到 `frontend/src/services/newcomerTavern.js`。
- 默认新手酒馆 `pw_lantern_helpdesk` 只有在公开且营业中时才会直接进入。
- 如果默认新手酒馆缺失、关闭或不再公开，会回退搜索公开营业的公益酒馆。
- 前端服务契约测试新增新人试玩回退覆盖，避免入口退化后首屏试玩不可用。

## 关键文件

- `frontend/src/services/newcomerTavern.js`
- `frontend/src/App.jsx`
- `frontend/scripts/service-contract-test.mjs`

## 验证

- `npm --prefix .\frontend test`
- `npm --prefix .\frontend run build`
- `py -3 -m pytest -q --tb=short -p no:cacheprovider tests/test_default_public_welfare_taverns.py`

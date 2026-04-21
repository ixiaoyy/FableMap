# 2026-04-21 Play Mode Consolidation

## Summary

收敛当前前端体验迭代：玩法模式识别、快捷开始、冒险工会任务板、NPC 性格模板和开店向导准备度检查。

## Changes

- 扩展 `tavernPlayModes` 回归测试，覆盖书签玩法识别和自定义同 ID 委托奖励。
- 修正冒险工会完成委托时实际传入 quest 的奖励优先级。
- 为 NPC 性格模板新增过滤纯函数和脚本测试。
- 将开店向导准备度检查抽为 `tavernCreateReadiness.js` 并补脚本测试。
- 将新增前端脚本纳入 `npm --prefix .\frontend test`。

## Verification

- `py -3 -m compileall -q fablemap`
- `py -3 -m pytest -q --tb=short`
- `npm --prefix .\frontend test`
- `npm --prefix .\frontend run build`

## Known Risks

- 冒险工会进度仍是 localStorage 本地状态，跨设备不同步。
- Vite production build 仍可能提示主 chunk 超过 500 kB，本轮未做代码拆分。
- 本轮测试是脚本级单元/合约测试，不包含浏览器端点击流程 E2E。

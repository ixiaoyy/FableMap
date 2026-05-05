# SillyTavern-style tavern chat workbench

## Context

用户确认将 `/tavern/:id` 默认体验改为更接近 SillyTavern 的聊天工作台：一进酒馆即可看到 NPC 列表、聊天记录和底部输入框，而不是先看到布局展示、分享、玩法和管理面板。

## Goals

- `/tavern/:id` 首屏以“选 NPC → 看聊天 → 输入发送”为主链路。
- 酒馆仍是主功能；分享、街区传闻、回访反馈、角色扮演管理、Home/学校/地点关系等既有功能先折叠。
- 店主管理面板只对当前 viewer 等于 `tavern.owner_id` 的人渲染。
- loader 不再在访客读取失败时自动用 `owner-demo` 回退，避免访客误看到店主态页面。
- Owner 后台进入酒馆时携带 `owner_id`，让店主能看到管理折叠面板。

## Non-goals

- 不改 backend schema / API 契约。
- 不引入新的 UI 框架、状态管理库或聊天依赖。
- 不实现平台生成酒馆内容、访客社交、平台 Token 充值/抽成。
- 不删除旧布局组件；本次只改变 tavern route 默认入口。

## Acceptance

- 静态契约脚本能证明新工作台存在、route 使用工作台、旧 layout showcase 不再作为 tavern 首屏、owner panel 有 ownership gate。
- 前端 `npm --prefix .\frontend test`、`typecheck`、`build` 通过。
- 如果本地浏览器/服务可运行，补一轮桌面和窄屏 Playwright 自验收；否则如实记录阻塞原因。

# 声音与环境反馈 MVP

Parent: `08-31-day-1-7-retention-slice`

## Goal

发布并接入真实 CC0 SFX/环境声，提供可持久化 Master/Music/SFX 设置并完成实际听音验收。

## Requirements

- 真实 SFX：三种脚步变体；锄地、浇水、砍树、敲石、收获、拾取；开门、买入、出售、对话翻页、睡觉。实际听音由真人按交付清单完成，Agent 负责确保真实文件、触发路径和静态合同存在。
- 真实环境层：Farm 风+鸟、Town 室外环境+低强度人声、Lakeshore 水声、全部室内 room tone；Foothills 可复用审定的自然层。
- Master/Music/SFX 三档 0–100% 设置立即生效并保存；本阶段无音乐轨，但 Music 设置合同保留。
- 只采用逐文件试听通过、允许商业使用与再分发的官方 CC0 文件；不采用 NC/ND/来源不明或需要单独强 copyleft 评审的声音。
- 音频二进制不进 Git；只发布采用子集到不可变 `game/media/v1`，登记来源、处理、bytes、MIME、SHA-256 与缓存头。
- 工具声音对齐 impact；交易只在成功后响；脚步只在真实移动时按有界节奏响；区域环境 crossfade 且不重复堆叠。
- autoplay/audio-context 失败不得阻断玩法，提供明确的启用/重试入口。

## Acceptance Criteria

- [ ] 列出的每个 SFX 都接入真实对应动作，且失败交易不会触发成功音；真人听音结果不阻塞代码交付。
- [ ] Farm、Town、Lakeshore、室内具有独立真实环境文件和互斥/crossfade 路由；可盲听区分由真人确认。
- [ ] 三个滑杆立即生效，刷新/继续后恢复；Master/SFX=0 时完全静音，Music 设置无假音乐播放。
- [ ] 页面未获 autoplay 权限时仍可进入游戏，首次有效手势后可恢复声音。
- [ ] manifest/CDN/同源代理的 URL、bytes、MIME、SHA-256、immutable cache 全部匹配，Git 跟踪音频二进制为零。
- [ ] 设置具备可访问标签、键盘操作和响应式规则；桌面、手机、200% zoom 由真人验收，typecheck/build 通过。

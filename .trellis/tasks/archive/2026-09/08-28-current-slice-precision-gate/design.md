# 现阶段纵向切片精细化总门禁：执行设计

## Quality model

每项统一按五维验收：Function 规则/保存正确；Feedback 300ms 内可理解；Presentation 像素/层级/色彩/文案一致；Input 鼠标/键盘/触摸/重复输入可靠；Route 在真实地图/设备路径成立。

## Evidence contract

- Agent 不再操作真实浏览器；每个子批先基于代码、配置、静态合同和已有证据定位确定性问题，真人按交付清单记录路径、视口和可复现现象。
- 问题分 P0 阻塞/数据风险、P1 明显误导或粗糙、P2 细节一致性；先 P0/P1。
- 截图/记录由真人验收提供且不加入生产 bundle；未收到真人证据的条目保持未勾选，但不阻塞已批准后续开发。
- 自动检查仅选最小相关子集；视觉批次不为证明视觉而扩 E2E。

## Child batches

1. Interaction/NPC/map entrance/signage polish。
2. Core function/action feedback polish。
3. Twelve-map collision/layer/interior polish。
4. HUD/modal/Social/responsive/accessibility polish。
5. Day-night/color/readability and motion consistency polish。
6. Full new-game→Town→sleep→refresh integration acceptance。

## Change boundaries

- 每个子批只改证据指向的窄文件；不顺带扩系统。
- 真实缺陷允许窄改 TMJ Collision/Object/AbovePlayer，但禁止偏好性重构地图。
- 玩法规则改动必须单独回到 PRD；纯 polish 不改变经济、好感、时间或存档公式。

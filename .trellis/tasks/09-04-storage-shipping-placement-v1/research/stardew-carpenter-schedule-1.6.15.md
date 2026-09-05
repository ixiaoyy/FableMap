# Stardew carpenter schedule reference

核对日期：2026-09-04。参考稳定版：PC 1.6.15。镜像岛只映射机制，角色 identity 继续使用既有西街木匠墨子。

来源：[Robin](https://stardewvalleywiki.com/Robin)、[Carpenter's Shop](https://stardewvalleywiki.com/Carpenter%27s_Shop)、[Shop Schedules](https://stardewvalleywiki.com/Shop_Schedules)、[Version History](https://stardewvalleywiki.com/Version_history)。

## Service and movement contract

- 普通日的柜台服务为 09:00–17:00；人物 08:00 已在柜台不代表服务已经开放。
- 普通非雨周二正式休息；普通雨天日程覆盖周二日程，服务恢复为 09:00–17:00。
- 普通非雨周五服务为 09:00–16:00，人物 16:00 离柜；Carpenter's Shop 页面还明确说明，离柜经过销售台时仍能短暂使用服务。
- 普通雨天日程覆盖所有更低优先级日程，人物留柜至 17:00。Carpenter's Shop 页面对周五只写 16:00 关门、未单列雨天周五；结合 Robin 页面明确的日程优先级和销售台位置决定服务可用性的过柜行为，本项目映射为雨天周五 09:00–17:00。这是公开资料链上的高可信推断，未冒充 1.6.15 实机或源码直证。
- 非雨周二约 09:40 与 20:00、夏季 18 日约 17:50，Robin 路过柜台时可能出现短暂可服务窗口。这是依赖人物位置与柜台碰撞的原作行为；`完全参考` 要求在对应日历/路径存在时保留，不能用全天营业替代。
- 下单后次日开始施工；Robin 在农场施工的每一天，木匠铺全天关闭。普通周二与普通雨天仍施工，节庆日不施工并顺延完工。
- 夏季 18 日因体检正式全天关闭。节庆营业、夜市和绿雨使用各自特殊日程；这些日历/事件尚不存在时条件不会触发，不得自行创造镜像岛替代日。

## Confirmed mapping

- 用户确认建筑服务先完全参考 Stardew；墨子不再沿用当前周日休息规则，而映射上述 Robin 营业、离柜、雨天、施工和特殊日合同。
- 必须同时复刻服务可用性与人物实际行程。只在周五 16:00 隐藏按钮、却让墨子继续停在工作点到 17:00，不算完成。
- 服务由墨子所在的木匠服务点提供；不能把所有 `shopAvailable` 复用成种子店，也不能允许玩家在任意地点靠近墨子就远程打开建筑菜单。

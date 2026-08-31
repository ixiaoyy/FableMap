# 实施计划

1. 把 NPC activity registry 泛化为四时段完整表，并扩展语义 activity kinds。
2. 更新 activity validator，核对八人四时段 region 与现有 day patrol 路线。
3. 扩展 NpcEntity activity visual，保持现有邻近显示、walking stride 和 waiting suffix。
4. 用窄确定性检查验证四时段活动完整、day patrol 不变、家庭夜间 cadence 同步。
5. 运行一次 typecheck 和 client build；不跑数据库、身份或大规模 E2E。

# NPC 动态生活对话 v1

## Goal

让八名现有居民在不同时间和地点表现出真实的日常，而不是无论在家、工作、湖岸或深夜都重复同一段自我介绍；以内容深化现有小镇，不扩建地图、NPC、经济或新玩法系统。

## Background

- 当前八名 NPC 已有 morning/day/evening/night 四段日程、地点、环境活动和基础好感。
- 每名 NPC 当前只有一个固定 `dialogueId`，`WorldScene` 不带时间上下文调用 `getDialogueDefinition()`。
- 华强 day phase 为 Shop，其余时段为 Dialogue；当前 welcome 文案同时被营业和离柜交谈复用。
- 现有居民静态对话已经确定姓名、职业和家庭关系，应保留这些设定并按时段展开，不重写人物身份。

## Requirements

- 八名 NPC 各提供 morning/day/evening/night 四类生活对话，内容必须符合当前 schedule region、职业活动与家庭设定。
- 同一时段固定提供两套按游戏日奇偶确定轮换的短对话，避免玩家连续两天只听到完全相同内容；同一天重复交谈保持稳定，不使用随机数。
- 华强 day phase 的第一行是营业欢迎语；morning/evening/night 只谈备货、收店或休息，不暗示可以交易。
- 对话只消费现有 `day`、`minuteOfDay`、`dialogueId`；不得新增 GameState/StoredGame/IndexedDB 字段。
- speaker 名称与 fallback 固定对话继续由现有 dialogue catalog 单一拥有；WorldScene 不按 npcId 硬编码台词。
- 公告板、家具、私人内屋、山路和湖岸 inspect 文案保持固定，不被居民轮换规则误处理。
- 每次 NPC 点击仍只触发一次 friendship command；逐句推进或重复打开面板不得额外增加好感。

## Acceptance Criteria

- [x] 八名 NPC 在四个 schedule phase 均能显示符合地点/活动的对话。
- [x] Day 1/Day 2 同一时段内容可轮换，同一天重复交谈内容稳定。
- [x] 华强只有 day counter 状态打开商店，非营业时段显示对应生活对话。
- [x] 现有姓名、家庭关系与职业设定无冲突，不出现未实现玩法承诺。
- [x] inspect 固定文案、每日首次交谈、Social 和输入锁行为保持不变。
- [x] 不升级 v6 存档，不新增图片、地图、数据库、migration 或大规模测试矩阵。

## Out of Scope

- 送礼、任务、分支选项、心事件、生日、天气/星期/季节对话。
- 语音、头像、打字机效果、LLM 动态生成或服务端内容接口。

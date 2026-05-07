import assert from "node:assert/strict"

import { buildRevisitCue, formatRevisitTime } from "../app/lib/revisit-summary.js"

const empty = buildRevisitCue(null)
assert.equal(empty.available, false)
assert.equal(empty.isReturning, false)
assert.equal(empty.title, "进入空间后建立回访状态")
assert.equal(empty.stageLabel, "未建立")
assert.equal(empty.visitCount, 0)
assert.ok(empty.promptHint.includes("进入空间"))

const firstVisit = buildRevisitCue(
  {
    visitor_id: "visitor-1",
    tavern_id: "tavern-1",
    visit_count: 1,
    first_visit: "2026-04-27T10:00:00Z",
    last_visit: "2026-04-27T10:00:00Z",
    relationship: { stage: "stranger", strength: 0.04 },
  },
  { tavernName: "星尘空间", characterName: "莉娜" },
)
assert.equal(firstVisit.available, true)
assert.equal(firstVisit.isReturning, false)
assert.equal(firstVisit.title, "第一次到访「星尘空间」")
assert.equal(firstVisit.stageLabel, "陌生人")
assert.equal(firstVisit.visitCount, 1)
assert.equal(firstVisit.strengthPercent, 4)
assert.ok(firstVisit.detail.includes("莉娜"))
assert.ok(firstVisit.chips.includes("陌生人"))
assert.ok(firstVisit.chips.includes("1 次到访"))

const returningVisit = buildRevisitCue(
  {
    visitor_id: "visitor-1",
    tavern_id: "tavern-1",
    visit_count: 3,
    first_visit: "2026-04-20T08:00:00Z",
    last_visit: "2026-04-27T10:20:00Z",
    relationship: { stage: "acquaintance", strength: 0.42 },
  },
  { tavernName: "星尘空间", characterName: "莉娜" },
)
assert.equal(returningVisit.available, true)
assert.equal(returningVisit.isReturning, true)
assert.equal(returningVisit.title, "欢迎回来，已第 3 次到访「星尘空间」")
assert.equal(returningVisit.stageLabel, "点头之交")
assert.equal(returningVisit.visitCount, 3)
assert.equal(returningVisit.strengthPercent, 42)
assert.ok(returningVisit.detail.includes("关系上下文"))
assert.ok(returningVisit.chips.includes("关系 42%"))
assert.notEqual(returningVisit.lastVisitLabel, "暂无记录")

const refreshedAfterChat = buildRevisitCue(
  {
    visitor_id: "visitor-1",
    tavern_id: "tavern-1",
    visit_count: 2,
    last_visit: "2026-04-27T10:30:00Z",
    relationship: { stage: "friend", strength: 0.51 },
  },
  { tavernName: "星尘空间" },
)
assert.equal(refreshedAfterChat.isReturning, true)
assert.equal(refreshedAfterChat.stageLabel, "朋友")
assert.ok(refreshedAfterChat.title.includes("欢迎回来"))
assert.ok(refreshedAfterChat.promptHint.includes("继续"))

const legacyRegular = buildRevisitCue(
  {
    visitor_id: "visitor-legacy",
    tavern_id: "tavern-1",
    visit_count: 2,
    relationship: { stage: "regular", strength: 0.44 },
  },
  { tavernName: "星尘空间" },
)
assert.equal(legacyRegular.stageLabel, "熟面孔")

const closeFriend = buildRevisitCue(
  {
    visitor_id: "visitor-close",
    tavern_id: "tavern-1",
    visit_count: 5,
    relationship: { stage: "close_friend", strength: 0.75 },
  },
  { tavernName: "星尘空间" },
)
assert.equal(closeFriend.stageLabel, "挚友")

assert.equal(formatRevisitTime("not-a-date"), "not-a-date")
assert.equal(formatRevisitTime(""), "暂无记录")

console.log("revisit-summary-test: ok")

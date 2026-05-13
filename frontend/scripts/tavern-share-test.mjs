import assert from "node:assert/strict"

import { buildTavernShareDisplay, buildTavernSharePayload, truncateShareText } from "../app/lib/tavern-share.js"

const payload = buildTavernSharePayload({
  id: "fog tavern/1",
  name: "雾港空间",
  description: "潮湿码头边的一间小空间，店主写下了旧灯塔、海风和夜班水手的设定。",
  lat: 31.2304,
  lon: 121.4737,
}, { origin: "https://fablemap.example/" })
assert.deepEqual({ title: payload.title, url: payload.url }, { title: "邀请你进入「雾港空间」", url: "https://fablemap.example/tavern/fog%20tavern%2F1" })
assert.ok(payload.summary.includes("潮湿码头") && payload.copyText.includes("坐标：31.23040, 121.47370") && payload.copyText.endsWith(payload.url))

const noDescription = buildTavernSharePayload({ id: "empty", name: "", lat: "bad", lon: null }, { origin: "" })
assert.deepEqual({ title: noDescription.title, summary: noDescription.summary, url: noDescription.url, hasNoCoords: noDescription.copyText.includes("坐标：未设置") }, { title: "邀请你进入「未命名空间」", summary: "店主还没有写下公开简介。", url: "/tavern/empty", hasNoCoords: true })

const longText = "这是一段很长的店主公开简介".repeat(12)
assert.ok(truncateShareText("  短简介  ", 10) === "短简介" && truncateShareText("", 10) === "" && truncateShareText(longText, 32).endsWith("…") && truncateShareText(longText, 32).length <= 33)

const serverDisplay = buildTavernShareDisplay({
  tavern_id: "fog tavern/1",
  title: "雾港空间",
  description: "这段完整描述来自后端公开分享接口。",
  short_description: "后端公开短简介",
  location: { lat: 31.2304, lon: 121.4737, address: "上海 · 外滩" },
  share_url: "https://fablemap.example/tavern/fog%20tavern%2F1",
  share_title: "邀请你进入「雾港空间」",
  share_text: "邀请你进入「雾港空间」：后端公开短简介",
})
assert.ok(serverDisplay.title === "邀请你进入「雾港空间」" && serverDisplay.summary === "后端公开短简介" && serverDisplay.copyText.includes("坐标：31.23040, 121.47370"))

console.log("tavern-share-test: ok")

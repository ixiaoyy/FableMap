import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const sourcePath = resolve(__dirname, "../app/lib/special-tavern-types.js")
const cultivationPlayPackPath = resolve(__dirname, "../app/lib/cultivation-play-pack.js")

assert.equal(
  existsSync(sourcePath),
  true,
  "special tavern type helper should exist so thin-layer rules stay shared across create/discover/tavern pages",
)
assert.equal(
  existsSync(cultivationPlayPackPath),
  true,
  "cultivation play pack helper should exist so owner-confirmed xiuxian defaults stay centralized",
)

const specialTypesModule = await import(pathToFileURL(sourcePath).href)
const cultivationPlayPackModule = await import(pathToFileURL(cultivationPlayPackPath).href)

assert.equal(typeof specialTypesModule.SPECIAL_TAVERN_TYPES, "object")
assert.equal(typeof specialTypesModule.deriveSpecialTavernType, "function")
assert.equal(typeof specialTypesModule.deriveSpecialTavernTypeDisplay, "function")
assert.equal(typeof specialTypesModule.buildSpecialTavernTypeDraftSeed, "function")
assert.equal(typeof specialTypesModule.specialTavernTypeMatchesTavern, "function")
assert.equal(typeof cultivationPlayPackModule.CULTIVATION_PLAY_PACK, "object")

const cultivationTavern = {
  name: "问道洞府",
  description: "山门边的洞府茶亭，适合来客问道和心境回访。",
  scene_prompt: "青灯、洞府、问道、修行札记与离线回访纪要。",
  layout_style: "quest-play",
  place_type: "tavern",
}

const cultivationDisplay = specialTypesModule.deriveSpecialTavernTypeDisplay(cultivationTavern)
assert.equal(cultivationDisplay.id, "cultivation-retreat")
assert.equal(cultivationDisplay.label, "修行空间")
assert.equal(cultivationDisplay.layoutStyle, "quest-play")
assert.equal(cultivationDisplay.playPackId, cultivationPlayPackModule.CULTIVATION_PLAY_PACK.id)
assert.equal(
  specialTypesModule.specialTavernTypeMatchesTavern(cultivationTavern, "cultivation-retreat"),
  true,
  "cultivation taverns should match the thin special-type filter",
)

const ordinaryTavern = {
  name: "夜色吧台",
  description: "普通陪伴空间。",
  scene_prompt: "霓虹、热红酒和老唱片。",
  layout_style: "npc-chat",
  place_type: "tavern",
}

assert.equal(
  specialTypesModule.deriveSpecialTavernType(ordinaryTavern),
  null,
  "ordinary taverns should not be forced into a special tavern type",
)

const draftSeed = specialTypesModule.buildSpecialTavernTypeDraftSeed("cultivation-retreat")
assert.equal(draftSeed.layout_style, "quest-play")
assert.equal(draftSeed.place_type, "tavern")
assert.equal(typeof draftSeed.scene_prompt, "string")
assert.ok(draftSeed.scene_prompt.includes("修行"), "draft seed should provide owner-confirmable cultivation copy")

const cultivationPack = cultivationPlayPackModule.CULTIVATION_PLAY_PACK
assert.equal(cultivationPack.id, "cultivation-play-pack")
assert.ok(cultivationPack.owner_confirmation_note.includes("店主"))
assert.ok(cultivationPack.preview_receipt.progress_delta.includes("仅当前访客可见"))
assert.ok(cultivationPack.preview_receipt.boundary_note.includes("公共排行"))
assert.equal(cultivationPack.breakthrough_preview.status, "未达")
assert.ok(Array.isArray(cultivationPack.breakthrough_preview.requirements))
assert.equal(cultivationPack.breakthrough_preview.requirements.length >= 4, true)
assert.ok(cultivationPack.breakthrough_preview.boundary_note.includes("公开 Tavern payload"))
assert.ok(cultivationPack.gameplay_definitions[0].completion.reward_text.includes("修为 +24000"))

const digitalHumanTavern = {
  name: "数字人制作酒馆",
  description: "在 NPC 档案师辅助下整理自己的数字人档案，可用于视频出镜和角色卡。",
  scene_prompt: "数字人工作室、视频出镜 prompt、短剧口播和授权边界确认。",
  layout_style: "npc-chat",
  place_type: "tavern",
}

const digitalHumanDisplay = specialTypesModule.deriveSpecialTavernTypeDisplay(digitalHumanTavern)
assert.equal(digitalHumanDisplay.id, "digital-human-studio")
assert.equal(digitalHumanDisplay.label, "数字人工作室")
assert.equal(digitalHumanDisplay.layoutStyle, "npc-chat")
assert.equal(
  specialTypesModule.specialTavernTypeMatchesTavern(digitalHumanTavern, "digital-human-studio"),
  true,
  "digital human taverns should match the portable identity workshop thin layer",
)

const digitalHumanSeed = specialTypesModule.buildSpecialTavernTypeDraftSeed("digital-human-studio")
assert.equal(digitalHumanSeed.layout_style, "npc-chat")
assert.equal(digitalHumanSeed.place_type, "tavern")
assert.ok(digitalHumanSeed.scene_prompt.includes("数字人"), "digital human seed should provide owner-confirmable digital human copy")
assert.ok(digitalHumanSeed.first_mes.includes("数字人制作酒馆"), "digital human seed should initialize an assistant NPC greeting")
assert.ok(Array.isArray(digitalHumanSeed.style_tags), "digital human seed should provide draft style tags")

console.log("special-tavern-types-test: ok")

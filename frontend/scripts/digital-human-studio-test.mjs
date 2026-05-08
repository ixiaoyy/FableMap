import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import {
  DIGITAL_HUMAN_DRAFT_FORBIDDEN,
  DIGITAL_HUMAN_DRAFT_STYLE_TAGS,
  DIGITAL_HUMAN_STUDIO_TYPE_ID,
  buildDigitalHumanIdentityPack,
  buildDigitalHumanVideoPrompt,
  isDigitalHumanStudioType,
} from "../app/lib/digital-human-studio.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

assert.equal(DIGITAL_HUMAN_STUDIO_TYPE_ID, "digital-human-studio")
assert.ok(DIGITAL_HUMAN_DRAFT_STYLE_TAGS.includes("视频出镜"))
assert.ok(DIGITAL_HUMAN_DRAFT_FORBIDDEN.some((item) => item.includes("语音克隆")))
assert.equal(isDigitalHumanStudioType("digital_human_studio"), true)

const pack = buildDigitalHumanIdentityPack({
  name: "林舟",
  description: "城市观察型数字人，擅长把真实坐标故事讲成一分钟短视频。",
  personality: "语速稳定，先给结论，再补一条细节。",
  scenario: "夜色街角的数字人制作酒馆，有镜前试演和脚本板。",
  system_prompt: "尊重授权，不冒充未授权真人，不索取手机号或私人地址。",
  first_mes: "大家好，我是林舟，今天用一分钟讲清这条街的故事。",
  tags: ["数字人", "口播"],
  appearance: { note: "深色风衣、冷光眼镜、城市夜景反光" },
})

assert.match(pack.oneLine, /林舟/)
assert.match(pack.visualStyle, /深色风衣/)
assert.match(pack.videoPrompt, /视频 \/ 短剧出镜 Prompt/)
assert.match(pack.videoPrompt, /示例口播/)
assert.match(pack.videoPrompt, /禁忌与授权边界/)
assert.match(buildDigitalHumanVideoPrompt({ name: "档案师" }), /档案师/)

const characterEditorSource = readFileSync(resolve(__dirname, "../app/product/CharacterEditor.jsx"), "utf8")
assert.ok(characterEditorSource.includes("buildDigitalHumanIdentityPack"))
assert.ok(characterEditorSource.includes("character-digital-human-pack"))
assert.ok(characterEditorSource.includes("复制出镜 Prompt"))

const characterModalSource = readFileSync(resolve(__dirname, "../app/product/CharacterManagementModal.jsx"), "utf8")
assert.ok(characterModalSource.includes("DIGITAL_HUMAN_DRAFT_STYLE_TAGS"))
assert.ok(characterModalSource.includes("生成数字人档案草稿"))

const createSource = readFileSync(resolve(__dirname, "../app/routes/create.tsx"), "utf8")
assert.ok(createSource.includes("DIGITAL_HUMAN_STUDIO_TYPE_ID"))
assert.ok(createSource.includes("可迁移数字人档案"))

console.log("digital-human-studio-test: ok")

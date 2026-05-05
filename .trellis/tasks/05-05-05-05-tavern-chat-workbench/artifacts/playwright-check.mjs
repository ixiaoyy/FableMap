import assert from "node:assert/strict"
import { mkdirSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { resolve } from "node:path"

const require = createRequire(new URL("../../../../frontend/package.json", import.meta.url))
const { chromium } = require("@playwright/test")

const outDir = resolve(".trellis", "tasks", "05-05-05-05-tavern-chat-workbench", "artifacts")
mkdirSync(outDir, { recursive: true })
const base = "http://127.0.0.1:8950"
const tavernId = "pw_lantern_helpdesk"
const ownerId = "system_public_welfare"

const browser = await chromium.launch()
const results = []

async function checkPage(name, url, viewport, expectOwnerPanel) {
  const page = await browser.newPage({ viewport })
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("Failed to load resource")) errors.push(message.text())
  })
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`)
  })
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.locator('[data-chat-workbench="sillytavern-style"]').waitFor({ timeout: 30000 })
  await page.locator('aside[aria-label="NPC 角色列表"]').waitFor({ timeout: 10000 })
  await page.locator('[aria-label="聊天记录"]').waitFor({ timeout: 10000 })
  await page.locator('textarea[placeholder^="Type a message"]').waitFor({ timeout: 10000 })
  const npcCount = await page.locator('aside[aria-label="NPC 角色列表"] button').count()
  assert.ok(npcCount > 0, `${name}: should render at least one NPC button`)
  const ownerPanelCount = await page.locator('[data-owner-only-panel]').count()
  if (expectOwnerPanel) {
    assert.ok(ownerPanelCount > 0, `${name}: owner should see management panel marker`)
  } else {
    assert.equal(ownerPanelCount, 0, `${name}: visitor should not see owner-only panel marker`)
  }
  const blockingErrors = errors.filter((item) => !item.includes("/favicon.ico"))
  assert.deepEqual(blockingErrors, [], `${name}: page should not emit console/page errors`)
  const screenshot = resolve(outDir, `${name}.png`)
  await page.screenshot({ path: screenshot, fullPage: true })
  await page.close()
  results.push({ name, url, viewport, screenshot, npcCount, ownerPanelCount })
}

await checkPage(
  "visitor-desktop",
  `${base}/tavern/${tavernId}`,
  { width: 1440, height: 1000 },
  false,
)
await checkPage(
  "visitor-mobile",
  `${base}/tavern/${tavernId}`,
  { width: 390, height: 844 },
  false,
)
await checkPage(
  "owner-desktop",
  `${base}/tavern/${tavernId}?owner_id=${encodeURIComponent(ownerId)}`,
  { width: 1440, height: 1000 },
  true,
)

await browser.close()
const report = resolve(outDir, "playwright-report.json")
writeFileSync(report, JSON.stringify({ ok: true, checkedAt: new Date().toISOString(), results }, null, 2) + "\n")
console.log(JSON.stringify({ ok: true, report, screenshots: results.map((result) => result.screenshot) }, null, 2))


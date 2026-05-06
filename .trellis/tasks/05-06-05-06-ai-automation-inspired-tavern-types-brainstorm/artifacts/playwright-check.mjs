import { chromium } from '../../../../frontend/node_modules/playwright/index.mjs'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const baseUrl = process.env.CREATE_INTENT_URL || 'http://127.0.0.1:5173/create'
const outDir = resolve('.trellis/tasks/05-06-05-06-ai-automation-inspired-tavern-types-brainstorm/artifacts')
await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const checks = []

async function checkViewport(name, viewport) {
  const page = await browser.newPage({ viewport })
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-tavern-intent-selector]', { timeout: 15000 })
  await page.click('[data-tavern-intent-card="workflow-clinic"]')
  const selected = await page.locator('[data-tavern-intent-card="workflow-clinic"][aria-pressed="true"]').count()
  const previewText = await page.locator('text=经营意图预览').count()
  const schemaCopy = await page.locator('text=不改 place_type / Schema').count()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
  const screenshot = resolve(outDir, `create-intent-${name}.png`)
  await page.screenshot({ path: screenshot, fullPage: true })
  await page.close()
  checks.push({ name, selected: selected > 0, previewText: previewText > 0, schemaCopy: schemaCopy > 0, horizontalOverflow: overflow, screenshot })
}

await checkViewport('desktop', { width: 1440, height: 1100 })
await checkViewport('mobile', { width: 390, height: 900 })
await browser.close()

const ok = checks.every((check) => check.selected && check.previewText && check.schemaCopy && !check.horizontalOverflow)
const report = { ok, baseUrl, checks, checkedAt: new Date().toISOString() }
await writeFile(resolve(outDir, 'playwright-report.json'), JSON.stringify(report, null, 2), 'utf8')
if (!ok) {
  console.error(JSON.stringify(report, null, 2))
  process.exit(1)
}
console.log('playwright-tavern-intent-check: ok')

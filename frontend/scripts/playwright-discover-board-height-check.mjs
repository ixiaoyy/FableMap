import assert from "node:assert/strict"
import { access, mkdir, readFile, writeFile } from "node:fs/promises"
import http from "node:http"
import { dirname, extname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { chromium, expect } from "@playwright/test"

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, "..", "..")
const buildDir = resolve(repoRoot, "frontend", "build", "client")
const artifactDir = resolve(
  repoRoot,
  ".trellis",
  "tasks",
  "05-05-05-05-discover-radar-density",
  "artifacts",
  "playwright-board-height",
)
const port = Number(process.env.FABLEMAP_PLAYWRIGHT_PORT || 4177)
const baseUrl = `http://127.0.0.1:${port}`

const taverns = Array.from({ length: 18 }, (_, index) => ({
  id: `discover_height_${index + 1}`,
  name: ["第三货架秘密社", "午夜小委托板", "放学后勇气铺", "静安猫铃小馆"][index % 4] + ` ${index + 1}`,
  description: "一间以真实坐标为锚点的发现入口，方便在桌面上验证长列表时的右栏高度与滚动表现。",
  lat: 31.22 + index * 0.001,
  lon: 121.46 + index * 0.001,
  address: `上海 · 坐标信号点 ${index + 1}`,
  access: index % 5 === 1 ? "password" : index % 5 === 2 ? "private" : "public",
  status: index % 6 === 0 ? "closed" : "open",
  place_type: "tavern",
  visit_count: 8 + index,
  local_time_display: `2${index % 4}:1${index % 6}`,
  is_open: index % 6 !== 0,
  scene_prompt: "霓虹街角、委托告示、店主确认的 NPC 与回访线索。",
  characters: [
    { id: `npc_a_${index}`, name: "茶博士", tags: ["委托板", "陪伴"] },
    { id: `npc_b_${index}`, name: "临时店员", tags: ["社区"] },
    { id: `npc_c_${index}`, name: "夜巡者", tags: ["夜谈"] },
  ],
}))

function contentTypeFor(filePath) {
  switch (extname(filePath).toLowerCase()) {
    case ".html":
      return "text/html; charset=utf-8"
    case ".js":
      return "application/javascript; charset=utf-8"
    case ".css":
      return "text/css; charset=utf-8"
    case ".json":
      return "application/json; charset=utf-8"
    case ".png":
      return "image/png"
    case ".jpg":
    case ".jpeg":
      return "image/jpeg"
    case ".svg":
      return "image/svg+xml"
    default:
      return "application/octet-stream"
  }
}

async function createSpaServer() {
  await access(join(buildDir, "index.html"))

  const server = http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url || "/", baseUrl)
      let filePath = resolve(buildDir, `.${requestUrl.pathname}`)
      try {
        const data = await readFile(filePath)
        res.writeHead(200, { "content-type": contentTypeFor(filePath) })
        res.end(data)
        return
      } catch {
        filePath = join(buildDir, "index.html")
        const data = await readFile(filePath)
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" })
        res.end(data)
      }
    } catch (error) {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" })
      res.end(String(error))
    }
  })

  await new Promise((resolvePromise) => server.listen(port, "127.0.0.1", resolvePromise))
  return server
}

async function installApiFixtures(page) {
  await page.route("**/api/v1/taverns**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify({ taverns, count: taverns.length }),
    })
  })
}

async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  assert(overflow.scrollWidth <= overflow.innerWidth + 2, `Unexpected horizontal overflow: ${JSON.stringify(overflow)}`)
}

async function desktopRadarCheck(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
  const page = await context.newPage()
  await installApiFixtures(page)
  await page.goto(`${baseUrl}/discover`, { waitUntil: "networkidle" })
  await page.evaluate(() => window.scrollTo({ top: 140, behavior: "instant" }))

  const radarBoard = page.locator('[data-discover-board="radar"]')
  const radarScroll = page.locator('[data-discover-board-scroll="radar-results"]')
  await expect(radarBoard).toBeVisible()
  await expect(radarScroll).toBeVisible()

  const boardMetrics = await radarBoard.evaluate((node) => {
    const rect = node.getBoundingClientRect()
    return {
      top: rect.top,
      bottom: rect.bottom,
      height: rect.height,
      viewportHeight: window.innerHeight,
    }
  })
  assert(
    boardMetrics.bottom <= boardMetrics.viewportHeight + 2,
    `Desktop radar board should fit inside the viewport: ${JSON.stringify(boardMetrics)}`,
  )

  const scrollMetrics = await radarScroll.evaluate((node) => ({
    clientHeight: node.clientHeight,
    scrollHeight: node.scrollHeight,
    overflowY: getComputedStyle(node).overflowY,
  }))
  assert(
    scrollMetrics.scrollHeight > scrollMetrics.clientHeight,
    `Desktop radar result list should scroll internally: ${JSON.stringify(scrollMetrics)}`,
  )
  assert(
    ["auto", "scroll"].includes(scrollMetrics.overflowY),
    `Desktop radar result list should use overflow-y auto/scroll: ${JSON.stringify(scrollMetrics)}`,
  )

  await assertNoHorizontalOverflow(page)

  const screenshotPath = resolve(artifactDir, "discover-radar-desktop-height.png")
  await page.screenshot({ path: screenshotPath, fullPage: true })
  await context.close()
  return { screenshotPath, boardMetrics, scrollMetrics }
}

async function desktopCardsCheck(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
  const page = await context.newPage()
  await installApiFixtures(page)
  await page.goto(`${baseUrl}/discover`, { waitUntil: "networkidle" })
  await page.evaluate(() => window.scrollTo({ top: 140, behavior: "instant" }))

  await page.getByRole("button", { name: "卡片视图" }).click()
  const cardsBoard = page.locator('[data-discover-board="cards"]')
  const cardsScroll = page.locator('[data-discover-board-scroll="card-results"]')
  await expect(cardsBoard).toBeVisible()
  await expect(cardsScroll).toBeVisible()

  const boardMetrics = await cardsBoard.evaluate((node) => {
    const rect = node.getBoundingClientRect()
    return {
      top: rect.top,
      bottom: rect.bottom,
      height: rect.height,
      viewportHeight: window.innerHeight,
    }
  })
  assert(
    boardMetrics.bottom <= boardMetrics.viewportHeight + 2,
    `Desktop cards board should fit inside the viewport: ${JSON.stringify(boardMetrics)}`,
  )

  const scrollMetrics = await cardsScroll.evaluate((node) => ({
    clientHeight: node.clientHeight,
    scrollHeight: node.scrollHeight,
    overflowY: getComputedStyle(node).overflowY,
  }))
  assert(
    ["auto", "scroll"].includes(scrollMetrics.overflowY),
    `Desktop cards result list should use overflow-y auto/scroll: ${JSON.stringify(scrollMetrics)}`,
  )

  await assertNoHorizontalOverflow(page)

  const screenshotPath = resolve(artifactDir, "discover-cards-desktop-height.png")
  await page.screenshot({ path: screenshotPath, fullPage: true })
  await context.close()
  return { screenshotPath, boardMetrics, scrollMetrics }
}

async function mobileCheck(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
  })
  const page = await context.newPage()
  await installApiFixtures(page)
  await page.goto(`${baseUrl}/discover`, { waitUntil: "networkidle" })

  await expect(page.locator('[data-discover-board="radar"]')).toBeVisible()
  await expect(page.getByText("附近坐标")).toBeVisible()
  await assertNoHorizontalOverflow(page)

  const screenshotPath = resolve(artifactDir, "discover-mobile-height.png")
  await page.screenshot({ path: screenshotPath, fullPage: true })
  await context.close()
  return { screenshotPath }
}

await mkdir(artifactDir, { recursive: true })

const server = await createSpaServer()
const browser = await chromium.launch()

try {
  const desktopRadar = await desktopRadarCheck(browser)
  const desktopCards = await desktopCardsCheck(browser)
  const mobile = await mobileCheck(browser)

  const reportPath = resolve(artifactDir, "report.md")
  const report = `# Discover Board Height Playwright Self Acceptance

Date: 2026-05-09
Base URL: ${baseUrl}

## Assertions

- Desktop radar board stays within the viewport instead of stretching the page indefinitely.
- Desktop radar/card result lists scroll inside dedicated containers when the mocked tavern list is long.
- Mobile discover route still renders without horizontal overflow.

## Desktop radar metrics

\`${JSON.stringify(desktopRadar.boardMetrics)}\`

\`${JSON.stringify(desktopRadar.scrollMetrics)}\`

## Desktop cards metrics

\`${JSON.stringify(desktopCards.boardMetrics)}\`

\`${JSON.stringify(desktopCards.scrollMetrics)}\`

## Screenshots

- \`${desktopRadar.screenshotPath}\`
- \`${desktopCards.screenshotPath}\`
- \`${mobile.screenshotPath}\`
`
  await writeFile(reportPath, report, "utf8")
  console.log("playwright-discover-board-height-check: ok")
  console.log(`report: ${reportPath}`)
} finally {
  await browser.close()
  await new Promise((resolvePromise, rejectPromise) => {
    server.close((error) => (error ? rejectPromise(error) : resolvePromise()))
  })
}

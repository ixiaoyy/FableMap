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
  "05-06-tavern-soft-currency-gifts-design",
  "artifacts",
  "playwright",
)
const port = Number(process.env.FABLEMAP_PLAYWRIGHT_PORT || 4176)
const baseUrl = `http://127.0.0.1:${port}`

const tavern = {
  id: "engagement-ux-demo",
  owner_id: "owner-engagement-ux",
  name: "纪念币茶馆",
  description: "完成轻玩法后可领纪念币，再给 NPC 送礼。",
  lat: 31.2304,
  lon: 121.4737,
  address: "上海 · 纪念街",
  access: "public",
  status: "open",
  place_type: "tavern",
  layout_style: "lobby",
  characters: [
    { id: "npc_tea", name: "茶博士", description: "温和接待访客。", first_mes: "欢迎来到纪念币茶馆。" },
    { id: "npc_host", name: "掌柜", description: "负责招呼客人。", first_mes: "今天也想和谁聊聊？" },
  ],
  gameplay_definitions: [],
  world_info: [],
  skill_packs: [],
}

function json(payload) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(payload),
  }
}

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
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url())
    const { pathname } = url
    const method = route.request().method()

    if (pathname === `/api/v1/taverns/${tavern.id}`) {
      return route.fulfill(json(tavern))
    }
    if (pathname === `/api/v1/taverns/${tavern.id}/roleplay`) {
      return route.fulfill(json({
        tavern_id: tavern.id,
        roleplay_mode: "ai_only",
        claims: [],
        characters: tavern.characters.map((character) => ({ id: character.id, name: character.name, avatar: "" })),
      }))
    }
    if (pathname === `/api/v1/taverns/${tavern.id}/share`) {
      return route.fulfill(json({
        tavern_id: tavern.id,
        title: tavern.name,
        description: tavern.description,
        short_description: tavern.description,
        cover: "",
        location: { lat: tavern.lat, lon: tavern.lon, address: tavern.address },
        status: tavern.status,
        access: tavern.access,
        tags: [],
        characters: tavern.characters.map((character) => ({ id: character.id, name: character.name, avatar: null })),
        character_count: tavern.characters.length,
        share_url: `${baseUrl}/tavern/${tavern.id}`,
      }))
    }
    if (pathname === `/api/v1/taverns/${tavern.id}/engagement/me`) {
      return route.fulfill(json({
        coin_label: "纪念币",
        wallet: { balance: 40, lifetime_earned: 80, lifetime_spent: 40 },
        vouchers_available: 1,
        daily_earned: 20,
      }))
    }
    if (pathname === `/api/v1/taverns/${tavern.id}/engagement/config`) {
      return route.fulfill(json({
        coin_label: "纪念币",
        gift_catalog: [
          { id: "warm_tea", name: "一杯热茶", icon: "🍵", price: 10, affinity_delta: 2, cooldown_hours: 12 },
          { id: "flower_bouquet", name: "花束", icon: "💐", price: 30, affinity_delta: 6, cooldown_hours: 24 },
        ],
        bonus_draw: { enabled: true, voucher_price: 30, daily_limit: 1 },
      }))
    }
    if (pathname === `/api/v1/taverns/${tavern.id}/engagement/gifts/send` && method === "POST") {
      const body = route.request().postDataJSON()
      return route.fulfill(json({
        success: true,
        gift_id: body.gift_id,
        character_id: body.character_id,
        amount: 10,
        affinity_delta: 2,
        cap_applied: false,
        reason: "",
        narration: "茶博士收下了礼物，轻轻点头致谢。",
        balance: 30,
      }))
    }
    if (pathname === `/api/v1/taverns/${tavern.id}/engagement/vouchers/redeem` && method === "POST") {
      return route.fulfill(json({
        success: true,
        voucher_id: "voucher_demo",
        reason: "",
        vouchers_remaining: 2,
        balance: 10,
      }))
    }
    if (pathname === `/api/v1/taverns/${tavern.id}/visitor-notes`) {
      return route.fulfill(json({ notes: [], count: 0 }))
    }
    if (pathname === "/api/v1/rumors") {
      return route.fulfill(json({ rumors: [], count: 0 }))
    }

    return route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ detail: `unmocked path: ${pathname}` }),
    })
  })
}

async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  if (overflow > 4) {
    throw new Error(`Unexpected horizontal overflow: ${overflow}`)
  }
}

async function revealPublicPanel(page) {
  const detailSection = page.locator("details").filter({ hasText: "更多空间功能" }).first()
  await expect(detailSection).toBeVisible()
  const isOpen = await detailSection.evaluate((node) => node.hasAttribute("open"))
  if (!isOpen) {
    await detailSection.locator("summary").click()
  }
  await expect(detailSection).toHaveAttribute("open", "")
  return detailSection
}

async function runDesktopCheck(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1600 } })
  const page = await context.newPage()
  await installApiFixtures(page)
  await page.goto(`${baseUrl}/tavern/${tavern.id}?user_id=visitor-engagement-ux`, { waitUntil: "networkidle" })

  const detailSection = await revealPublicPanel(page)
  await expect(detailSection.locator("[data-engagement-panel]")).toBeVisible()
  await expect(detailSection.getByText("空间纪念币与礼物")).toBeVisible()
  await expect(detailSection.getByRole("button", { name: "茶博士", exact: true })).toBeVisible()
  await expect(detailSection.getByText("抽奖券商店")).toBeVisible()
  await assertNoHorizontalOverflow(page)

  const screenshotPath = resolve(artifactDir, "desktop-engagement-panel.png")
  await page.screenshot({ path: screenshotPath, fullPage: true })
  await context.close()
  return screenshotPath
}

async function runMobileCheck(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 1320 },
    deviceScaleFactor: 1,
    isMobile: true,
  })
  const page = await context.newPage()
  await installApiFixtures(page)
  await page.goto(`${baseUrl}/tavern/${tavern.id}?user_id=visitor-engagement-ux`, { waitUntil: "networkidle" })

  const detailSection = await revealPublicPanel(page)
  await expect(detailSection.locator("[data-engagement-panel]")).toBeVisible()
  await expect(detailSection.getByText("选择送礼对象")).toBeVisible()
  await expect(detailSection.getByText("完成店主已发布的玩法后，可领取本空间纪念币。")).toBeVisible()
  await assertNoHorizontalOverflow(page)

  const screenshotPath = resolve(artifactDir, "mobile-engagement-panel.png")
  await page.screenshot({ path: screenshotPath, fullPage: true })
  await context.close()
  return screenshotPath
}

await mkdir(artifactDir, { recursive: true })

const server = await createSpaServer()
const browser = await chromium.launch()
const screenshots = []

try {
  screenshots.push(await runDesktopCheck(browser))
  screenshots.push(await runMobileCheck(browser))
} finally {
  await browser.close()
  await new Promise((resolvePromise, rejectPromise) => {
    server.close((error) => (error ? rejectPromise(error) : resolvePromise()))
  })
}

const reportPath = resolve(artifactDir, "report.md")
const report = `# Engagement Panel Playwright Self Acceptance

Date: 2026-05-09
Base URL: ${baseUrl}

## Assertions

- Tavern route renders the visitor engagement panel with wallet, gift, and voucher sections.
- Gift catalog normalization accepts backend \`icon\` fields and shows the selected NPC gift surface.
- Desktop and mobile viewports render without obvious horizontal overflow.

## Screenshots

${screenshots.map((item) => `- \`${item}\``).join("\n")}

## Limits

- Playwright uses mocked API fixtures; it validates route wiring and client-side rendering only.
- This pass does not cover real gameplay completion or backend persistence.
`

await writeFile(reportPath, report, "utf8")
console.log("playwright-engagement-panel-check: ok")
console.log(`report: ${reportPath}`)

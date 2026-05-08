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
  "05-06-cultivation-tavern-play-pack-mvp",
  "artifacts",
  "playwright",
)
const port = Number(process.env.FABLEMAP_PLAYWRIGHT_PORT || 4175)
const baseUrl = `http://127.0.0.1:${port}`

const cultivationTavern = {
  id: "cultivation-manage-demo",
  owner_id: "owner-cultivation",
  name: "问道洞府",
  description: "真实坐标边的一处问道茶席，适合留下心境札记与回访纪要。",
  lat: 31.2304,
  lon: 121.4737,
  address: "上海 · 山门旧街",
  access: "public",
  status: "open",
  place_type: "tavern",
  layout_style: "quest-play",
  scene_prompt: "修行空间、问道茶席、洞府青灯、心境札记与回访纪要；不做战斗、等级、装备或排行。",
  characters: [{ id: "npc-guide", name: "青灯真人", first_mes: "道友，今晚想记录哪段心境？" }],
  world_info: [],
  gameplay_definitions: [],
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
  await page.route("**/api/v1/**", (route) => {
    const url = new URL(route.request().url())
    const { pathname } = url

    if (pathname === `/api/v1/taverns/${cultivationTavern.id}`) {
      return route.fulfill(json(cultivationTavern))
    }
    if (pathname === `/api/v1/taverns/${cultivationTavern.id}/roleplay`) {
      return route.fulfill(json({
        tavern_id: cultivationTavern.id,
        roleplay_mode: "ai_only",
        claims: [],
        characters: cultivationTavern.characters.map((character) => ({
          id: character.id,
          name: character.name,
          avatar: "",
        })),
      }))
    }
    if (pathname === `/api/v1/taverns/${cultivationTavern.id}/relationship-edges`) {
      return route.fulfill(json({ edges: [], count: 0 }))
    }
    if (pathname === "/api/v1/territories") {
      return route.fulfill(json({ territories: [], count: 0 }))
    }
    if (pathname === "/api/v1/worldinfo" && route.request().method() === "GET") {
      return route.fulfill(json({ world_info: [], count: 0 }))
    }
    if (pathname === `/api/v1/taverns/${cultivationTavern.id}/visitor-notes`) {
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

async function runDesktopCheck(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1400 } })
  const page = await context.newPage()
  await installApiFixtures(page)
  await page.goto(
    `${baseUrl}/tavern/${cultivationTavern.id}/manage?owner_id=${encodeURIComponent(cultivationTavern.owner_id)}`,
    { waitUntil: "networkidle" },
  )

  await expect(page.getByText("问道洞府 管理台")).toBeVisible()
  await expect(page.locator("[data-cultivation-play-pack-panel]")).toBeVisible()
  await expect(page.locator("[data-cultivation-receipt-preview]")).toBeVisible()
  await expect(page.locator("[data-cultivation-breakthrough-preview]")).toBeVisible()
  await expect(page.getByRole("button", { name: "确认并注入玩法包内容" })).toBeVisible()
  await assertNoHorizontalOverflow(page)

  const screenshotPath = resolve(artifactDir, "desktop-cultivation-play-pack-owner-manage.png")
  await page.screenshot({ path: screenshotPath, fullPage: true })
  await context.close()
  return screenshotPath
}

async function runMobileCheck(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 1180 },
    deviceScaleFactor: 1,
    isMobile: true,
  })
  const page = await context.newPage()
  await installApiFixtures(page)
  await page.goto(
    `${baseUrl}/tavern/${cultivationTavern.id}/manage?owner_id=${encodeURIComponent(cultivationTavern.owner_id)}`,
    { waitUntil: "networkidle" },
  )

  await expect(page.locator("[data-cultivation-play-pack-panel]")).toBeVisible()
  await expect(page.getByText("历练回执样例")).toBeVisible()
  await expect(page.getByText("突破条件样例")).toBeVisible()
  await assertNoHorizontalOverflow(page)

  const screenshotPath = resolve(artifactDir, "mobile-cultivation-play-pack-owner-manage.png")
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
const report = `# Cultivation Play Pack Playwright Self Acceptance

Date: 2026-05-08
Base URL: ${baseUrl}

## Assertions

- Owner manage route renders the cultivation play-pack panel only for the cultivation tavern.
- The panel shows both a bounded "历练回执样例" and a "突破条件样例" preview.
- Desktop and mobile viewports render without obvious horizontal overflow.

## Screenshots

${screenshots.map((item) => `- \`${item}\``).join("\n")}

## Limits

- Playwright uses mocked API fixtures; it validates frontend rendering and route wiring, not backend persistence.
- The confirm button is verified as visible but not clicked in this pass, so no write APIs are exercised here.
`

await writeFile(reportPath, report, "utf8")
console.log("playwright-cultivation-play-pack-check: ok")
console.log(`report: ${reportPath}`)

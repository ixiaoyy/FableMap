import { createReadStream } from "node:fs"
import { access, mkdir, readFile, writeFile } from "node:fs/promises"
import http from "node:http"
import { extname, dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { chromium, expect } from "@playwright/test"

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, "..", "..")
const buildDir = resolve(repoRoot, "frontend", "build", "client")
const artifactDir = resolve(repoRoot, ".trellis", "tasks", "05-06-special-tavern-type-thin-layer", "artifacts", "playwright")
const port = Number(process.env.FABLEMAP_PLAYWRIGHT_PORT || 4174)
const baseUrl = `http://127.0.0.1:${port}`

const cultivationTavern = {
  id: "cultivation-demo",
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
  visit_count: 18,
  characters: [
    { id: "npc-guide", name: "灯下引路人", first_mes: "道友，今晚想记录哪段心境？" },
  ],
  world_info: [
    { id: "wi-1", title: "洞府规矩", keyword: "问道", content: "来客可以留修行札记，但不做战斗或升级。" },
  ],
  gameplay_definitions: [],
  skill_packs: [],
}

const ordinaryTavern = {
  id: "ordinary-demo",
  owner_id: "owner-ordinary",
  name: "夜色吧台",
  description: "普通陪伴空间。",
  lat: 31.2243,
  lon: 121.4692,
  address: "上海 · 夜航街口",
  access: "public",
  status: "open",
  place_type: "tavern",
  layout_style: "npc-chat",
  scene_prompt: "霓虹、唱片与热红酒。",
  visit_count: 4,
  characters: [
    { id: "npc-bartender", name: "阿珀", first_mes: "欢迎回到吧台。" },
  ],
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

    if (pathname === `/api/v1/taverns/${cultivationTavern.id}/roleplay`) {
      return route.fulfill(json({
        tavern_id: cultivationTavern.id,
        roleplay_mode: "ai_only",
        claims: [],
        characters: cultivationTavern.characters.map((character) => ({
          id: character.id,
          name: character.name,
          avatar: character.avatar || "",
        })),
      }))
    }

    if (pathname === `/api/v1/taverns/${cultivationTavern.id}/share`) {
      return route.fulfill(json({
        tavern_id: cultivationTavern.id,
        url: `${baseUrl}/tavern/${cultivationTavern.id}`,
        title: cultivationTavern.name,
        summary: cultivationTavern.description,
        copy_text: `来这里问道：${cultivationTavern.name} ${baseUrl}/tavern/${cultivationTavern.id}`,
        characters: cultivationTavern.characters.map((character) => character.name).join(" · "),
      }))
    }

    if (pathname === "/api/v1/rumors") {
      return route.fulfill(json({ rumors: [], count: 0 }))
    }

    if (pathname === `/api/v1/taverns/${cultivationTavern.id}`) {
      return route.fulfill(json(cultivationTavern))
    }

    if (pathname === `/api/v1/taverns/${ordinaryTavern.id}`) {
      return route.fulfill(json(ordinaryTavern))
    }

    if (pathname === "/api/v1/taverns") {
      return route.fulfill(json({ taverns: [cultivationTavern, ordinaryTavern], count: 2 }))
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

async function runCreateCheck(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } })
  const page = await context.newPage()
  await installApiFixtures(page)
  await page.goto(`${baseUrl}/create?special_tavern_type=cultivation-retreat`, { waitUntil: "networkidle" })

  await expect(page.getByText("特殊空间模板")).toBeVisible()
  await expect(page.locator('[data-special-tavern-type-preview="cultivation-retreat"]')).toBeVisible()
  await page.getByRole("button", { name: "填入模板文案" }).click()
  await expect(page.locator('textarea[name="scene_prompt"]')).toHaveValue(/修行空间/)
  await assertNoHorizontalOverflow(page)

  const screenshotPath = resolve(artifactDir, "desktop-create-special-tavern-type.png")
  await page.screenshot({ path: screenshotPath, fullPage: true })
  await context.close()
  return screenshotPath
}

async function runDiscoverCheck(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } })
  const page = await context.newPage()
  await installApiFixtures(page)
  await page.goto(`${baseUrl}/discover`, { waitUntil: "networkidle" })

  await expect(page.getByText("专题体验", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "修行空间" }).click()
  await expect(page.getByText("问道洞府")).toBeVisible()
  await expect(page.getByText("夜色吧台")).toHaveCount(0)
  await assertNoHorizontalOverflow(page)

  const screenshotPath = resolve(artifactDir, "desktop-discover-special-tavern-type.png")
  await page.screenshot({ path: screenshotPath, fullPage: true })
  await context.close()
  return screenshotPath
}

async function runTavernCheck(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 920 },
    deviceScaleFactor: 1,
    isMobile: true,
  })
  const page = await context.newPage()
  await installApiFixtures(page)
  await page.goto(`${baseUrl}/tavern/${cultivationTavern.id}`, { waitUntil: "networkidle" })

  const moreFeatures = page.locator("summary").filter({ hasText: "更多空间功能" }).first()
  if (await moreFeatures.count()) {
    await moreFeatures.click()
  }
  await expect(page.locator('[data-special-tavern-type-card="cultivation-retreat"]')).toBeVisible()
  await assertNoHorizontalOverflow(page)

  const screenshotPath = resolve(artifactDir, "mobile-tavern-special-tavern-type.png")
  await page.screenshot({ path: screenshotPath, fullPage: true })
  await context.close()
  return screenshotPath
}

await mkdir(artifactDir, { recursive: true })

const server = await createSpaServer()
const browser = await chromium.launch()
const screenshots = []

try {
  screenshots.push(await runCreateCheck(browser))
  screenshots.push(await runDiscoverCheck(browser))
  screenshots.push(await runTavernCheck(browser))
} finally {
  await browser.close()
  await new Promise((resolvePromise, rejectPromise) => {
    server.close((error) => (error ? rejectPromise(error) : resolvePromise()))
  })
}

const reportPath = resolve(artifactDir, "report.md")
const report = `# Special Tavern Type Thin Layer Playwright Self Acceptance

Date: 2026-05-07
Base URL: ${baseUrl}

## Assertions

- Create route renders the thin special tavern type selector and can fill owner-confirmed cultivation copy.
- Discover route exposes a dedicated "专题体验" filter and narrows results to cultivation taverns.
- Mobile tavern route can surface the derived special tavern type card without obvious horizontal overflow.

## Screenshots

${screenshots.map((item) => `- \`${item}\``).join("\n")}

## Limits

- Playwright uses mocked API fixtures; it validates frontend rendering and filter wiring, not backend persistence.
- Chromium only.
`

await writeFile(reportPath, report, "utf8")
console.log("playwright-special-tavern-type-thin-layer-check: ok")
console.log(`report: ${reportPath}`)

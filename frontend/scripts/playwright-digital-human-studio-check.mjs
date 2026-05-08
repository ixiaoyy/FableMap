import { access, mkdir, readFile, writeFile } from "node:fs/promises"
import http from "node:http"
import { extname, dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { chromium, expect } from "@playwright/test"

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, "..", "..")
const buildDir = resolve(repoRoot, "frontend", "build", "client")
const artifactDir = resolve(repoRoot, ".trellis", "tasks", "05-08-digital-human-tavern-brainstorm", "artifacts", "playwright")
const port = Number(process.env.FABLEMAP_PLAYWRIGHT_PORT || 4176)
const baseUrl = `http://127.0.0.1:${port}`

const digitalHumanTavern = {
  id: "digital-human-demo",
  owner_id: "owner-digital-human",
  name: "数字人制作酒馆",
  description: "在 NPC 档案师辅助下整理自己的数字人档案，可用于角色卡、视频出镜和短剧口播。",
  lat: 31.2304,
  lon: 121.4737,
  address: "上海 · 镜前街口",
  access: "public",
  status: "open",
  place_type: "tavern",
  layout_style: "npc-chat",
  scene_prompt: "数字人工作室、视频出镜 prompt、短剧口播和授权边界确认；不直接生成视频、语音克隆或真人影像。",
  visit_count: 7,
  characters: [
    {
      id: "npc-digital-archivist",
      name: "数字人档案师",
      first_mes: "我们先确认这个数字人的用途和授权边界。",
      description: "辅助整理身份、口吻、外观风格和视频出镜 prompt。",
    },
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

    if (pathname === `/api/v1/taverns/${digitalHumanTavern.id}/roleplay`) {
      return route.fulfill(json({
        tavern_id: digitalHumanTavern.id,
        roleplay_mode: "ai_only",
        claims: [],
        characters: digitalHumanTavern.characters.map((character) => ({
          id: character.id,
          name: character.name,
          avatar: character.avatar || "",
        })),
      }))
    }

    if (pathname === `/api/v1/taverns/${digitalHumanTavern.id}/share`) {
      return route.fulfill(json({
        tavern_id: digitalHumanTavern.id,
        url: `${baseUrl}/tavern/${digitalHumanTavern.id}`,
        title: digitalHumanTavern.name,
        summary: digitalHumanTavern.description,
        copy_text: `${digitalHumanTavern.name}：${baseUrl}/tavern/${digitalHumanTavern.id}`,
        characters: "数字人档案师",
      }))
    }

    if (pathname === "/api/v1/rumors") {
      return route.fulfill(json({ rumors: [], count: 0 }))
    }

    if (pathname === `/api/v1/taverns/${digitalHumanTavern.id}`) {
      return route.fulfill(json(digitalHumanTavern))
    }

    if (pathname === "/api/v1/taverns") {
      return route.fulfill(json({ taverns: [digitalHumanTavern], count: 1 }))
    }

    if (pathname === "/api/v1/owners/me/default-llm") {
      return route.fulfill(json({ configured: false, config: null }))
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
  await page.goto(`${baseUrl}/create?special_tavern_type=digital-human-studio`, { waitUntil: "networkidle" })

  await expect(page.getByText("数字人工作室").first()).toBeVisible()
  await expect(page.getByText("可迁移数字人档案").first()).toBeVisible()
  await page.getByRole("button", { name: "填入模板文案" }).click()
  await expect(page.locator('input[name="character_name"]')).toHaveValue(/数字人档案师/)
  await expect(page.locator('textarea[name="scene_prompt"]')).toHaveValue(/数字人/)
  await assertNoHorizontalOverflow(page)

  const screenshotPath = resolve(artifactDir, "desktop-create-digital-human-studio.png")
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
  await page.goto(`${baseUrl}/tavern/${digitalHumanTavern.id}`, { waitUntil: "networkidle" })

  const moreFeatures = page.locator("summary").filter({ hasText: "更多空间功能" }).first()
  if (await moreFeatures.count()) {
    await moreFeatures.click()
  }
  await expect(page.locator('[data-special-tavern-type-card="digital-human-studio"]')).toBeVisible()
  await expect(page.getByText("可迁移数字人档案").first()).toBeVisible()
  await assertNoHorizontalOverflow(page)

  const screenshotPath = resolve(artifactDir, "mobile-tavern-digital-human-studio.png")
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
  screenshots.push(await runTavernCheck(browser))
} finally {
  await browser.close()
  await new Promise((resolvePromise, rejectPromise) => {
    server.close((error) => (error ? rejectPromise(error) : resolvePromise()))
  })
}

const reportPath = resolve(artifactDir, "report.md")
const report = `# Digital Human Studio Playwright Self Acceptance

Date: 2026-05-08
Base URL: ${baseUrl}

## Assertions

- Desktop create route renders the digital-human-studio special tavern type and can fill owner-confirmable template copy.
- Mobile tavern route surfaces the digital human special type card and portable identity / video prompt positioning.
- Both checked routes avoid obvious horizontal overflow.

## Screenshots

${screenshots.map((item) => `- \`${item}\``).join("\n")}

## Limits

- Playwright uses mocked API fixtures; it validates frontend rendering and thin-layer wiring, not backend persistence.
- Chromium only.
`

await writeFile(reportPath, report, "utf8")
console.log("playwright-digital-human-studio-check: ok")
console.log(`report: ${reportPath}`)

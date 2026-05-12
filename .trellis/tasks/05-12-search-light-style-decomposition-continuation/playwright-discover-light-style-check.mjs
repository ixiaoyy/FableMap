import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { access, mkdir, readFile, writeFile } from "node:fs/promises"
import http from "node:http"
import { dirname, extname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, "../../..")
const require = createRequire(resolve(repoRoot, "frontend", "package.json"))
const { chromium, expect } = require("@playwright/test")

const buildDir = resolve(repoRoot, "frontend", "build", "client")
const evidenceDir = resolve(here, "evidence")
const port = Number(process.env.FABLEMAP_DISCOVER_STYLE_PORT || process.env.FABLEMAP_DISCOVER_LIGHT_PORT || 4192)
const baseUrl = `http://127.0.0.1:${port}`

const taverns = [
  { id: "rain-bookshop", name: "雨巷书店", description: "雨声里仍有人回应的书店坐标。", lat: 31.2304, lon: 121.4737, address: "上海 · 雨巷 17 号", access: "public", status: "open", place_type: "bookstore", visit_count: 42, characters: [{ id: "keeper", name: "旧书守夜人", tags: ["书店", "陪伴"] }] },
  { id: "sea-end", name: "海街的尽头", description: "海风、灯塔和一只会记住回访的猫。", lat: 35.6895, lon: 139.6917, address: "东京 · 海街边界", access: "public", status: "open", place_type: "cafe", visit_count: 18, characters: [{ id: "cat", name: "潮汐猫", tags: ["咖啡", "树洞"] }] },
  { id: "time-cafe", name: "时光咖啡馆", description: "适合低声交谈和写下回访记忆。", lat: 22.3193, lon: 114.1694, address: "香港 · 夜间街角", access: "public", status: "open", place_type: "cafe", visit_count: 64, characters: [{ id: "barista", name: "记忆咖啡师", tags: ["陪伴", "咖啡"] }] },
  { id: "old-platform", name: "旧车站月台", description: "最后一班车离开后，月台广播仍在轻轻闪烁。", lat: 34.6937, lon: 135.5023, address: "大阪 · 旧站台", access: "public", status: "open", place_type: "tavern", visit_count: 7, characters: [{ id: "announcer", name: "月台播报员", tags: ["委托板"] }] },
]

function contentTypeFor(filePath) {
  switch (extname(filePath).toLowerCase()) {
    case ".html": return "text/html; charset=utf-8"
    case ".js": return "application/javascript; charset=utf-8"
    case ".css": return "text/css; charset=utf-8"
    case ".json": return "application/json; charset=utf-8"
    case ".png": return "image/png"
    case ".svg": return "image/svg+xml"
    default: return "application/octet-stream"
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
      } catch {
        const data = await readFile(join(buildDir, "index.html"))
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
    await route.fulfill({ status: 200, contentType: "application/json; charset=utf-8", body: JSON.stringify({ taverns, count: taverns.length }) })
  })
}

async function checkNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({ innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }))
  assert.ok(overflow.scrollWidth <= overflow.innerWidth + 2, `Unexpected horizontal overflow: ${JSON.stringify(overflow)}`)
}

async function assertSquareImages(page) {
  const imageInfo = await page.locator('[data-soul-link-discover-square-image="512x512"]').evaluateAll((images) =>
    images.map((image) => ({ width: image.naturalWidth, height: image.naturalHeight, src: image.getAttribute("src") })).filter((item) => item.src && item.width > 0),
  )
  assert.ok(imageInfo.length >= 6, `Expected multiple square discover images, got ${imageInfo.length}`)
  for (const item of imageInfo) {
    assert.equal(item.width, item.height, `Expected 1:1 image resource: ${item.src}`)
  }
}

async function assertAllVisibleImagesAreSquare(surface, testCase) {
  const imageInfo = await surface.locator("img:visible").evaluateAll((images) =>
    images.map((image) => ({
      width: image.naturalWidth,
      height: image.naturalHeight,
      src: image.getAttribute("src"),
      marker: image.getAttribute("data-soul-link-discover-square-image") || image.getAttribute("data-soul-link-sidebar-invite") || "",
    })).filter((item) => item.src && item.width > 0),
  )
  assert.ok(imageInfo.length >= 8, `Expected visible ${testCase.variant} discover images, got ${imageInfo.length}`)
  for (const item of imageInfo) {
    assert.equal(item.width, item.height, `Visible ${testCase.variant} discover image is not 1:1: ${item.src} marker=${item.marker}`)
    assert.match(item.src, /\/assets\/card-[^/]+\.png(?:$|\?)/, `Visible ${testCase.variant} discover image should come from atomic card material, not shared UI screenshot/icon: ${item.src}`)
  }
}

async function checkCase(browser, testCase) {
  const context = await browser.newContext({ viewport: testCase.viewport })
  const page = await context.newPage()
  const pageErrors = []
  page.on("pageerror", (error) => pageErrors.push(error.message))
  page.on("console", (message) => { if (message.type() === "error") pageErrors.push(message.text()) })
  await page.addInitScript((theme) => window.localStorage.setItem("fablemap-theme", theme), testCase.theme)
  await installApiFixtures(page)
  await page.goto(`${baseUrl}/discover`, { waitUntil: "networkidle" })

  const surface = page.locator(`[data-soul-link-reference="${testCase.marker}"]`)
  await expect(surface).toBeVisible()
  await expect(page.locator('[data-soul-link-real-dom="true"]')).toHaveAttribute("data-soul-link-variant", testCase.variant)
  const search = page.locator('[data-soul-link-search="real-input"] input:visible').first()
  await expect(search).toBeVisible()
  await search.fill("雨")
  await expect(search).toHaveValue("雨")
  if (testCase.viewport.width >= 768) {
    await expect(page.locator('[data-soul-link-discover-card-copy="real-text-layer"]').first()).toBeVisible()
    await expect(page.locator('[data-soul-link-discover-card-cover="real-image"]').first()).toBeVisible()
    await expect(surface.locator('[data-soul-link-sidebar-invite="real-dom"]')).toBeVisible()
    await expect(surface.locator('[data-soul-link-sidebar-invite="fixed-image"]')).toHaveCount(0)
    await expect(surface.locator('img[data-soul-link-feed-thumb="real-image"][data-soul-link-discover-square-image="512x512"]').first()).toBeVisible()
    await expect(surface.locator('img[data-soul-link-online-avatar="real-image"][data-soul-link-discover-square-image="512x512"]').first()).toBeVisible()
  } else {
    await expect(page.getByText("探索结果").first()).toBeVisible()
  }
  await assertSquareImages(page)
  await assertAllVisibleImagesAreSquare(surface, testCase)
  await checkNoHorizontalOverflow(page)
  assert.deepEqual(pageErrors, [], `No browser console/page errors expected for ${testCase.name}`)

  const screenshotPath = resolve(evidenceDir, testCase.screenshot)
  await page.screenshot({ path: screenshotPath, fullPage: true })
  await context.close()
  return screenshotPath
}

await mkdir(evidenceDir, { recursive: true })
const server = await createSpaServer()
const browser = await chromium.launch()

try {
  const cases = [
    { name: "discover-light-desktop", variant: "light", theme: "light", marker: "discover-light-real-dom-1536x1024", viewport: { width: 1536, height: 1024 }, screenshot: "discover-light-style-desktop.png" },
    { name: "discover-light-mobile", variant: "light", theme: "light", marker: "discover-light-real-dom-1536x1024", viewport: { width: 390, height: 844 }, screenshot: "discover-light-style-mobile.png" },
    { name: "discover-black-desktop", variant: "black", theme: "dark", marker: "discover-black-real-dom-1536x1024", viewport: { width: 1536, height: 1024 }, screenshot: "discover-black-style-desktop.png" },
    { name: "discover-black-mobile", variant: "black", theme: "dark", marker: "discover-black-real-dom-1536x1024", viewport: { width: 390, height: 844 }, screenshot: "discover-black-style-mobile.png" },
  ]
  const rows = []
  for (const testCase of cases) {
    const screenshotPath = await checkCase(browser, testCase)
    rows.push(`| ${testCase.name} | ${testCase.viewport.width}x${testCase.viewport.height} | \`${screenshotPath}\` | PASS |`)
  }
  const reportPath = resolve(evidenceDir, "discover-style-check.md")
  await writeFile(reportPath, `# Discover shared template style Playwright check\n\nBase URL: ${baseUrl}\n\n| Case | Viewport | Screenshot | Verdict |\n| --- | --- | --- | --- |\n${rows.join("\n")}\n`, "utf8")
  console.log("playwright-discover-style-check: ok")
  console.log(`report: ${reportPath}`)
} finally {
  await browser.close()
  await new Promise((resolvePromise, rejectPromise) => server.close((error) => (error ? rejectPromise(error) : resolvePromise())))
}

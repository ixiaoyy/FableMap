const fs = require('fs')
const http = require('http')
const path = require('path')
const { spawn, spawnSync } = require('child_process')
const { chromium } = require('playwright')

const repoRoot = path.resolve(__dirname, '..', '..', '..')
const frontendRoot = path.join(repoRoot, 'frontend')
const tempPublicDir = path.join(frontendRoot, 'public', '__trellis_tmp')
const tempModuleDir = path.join(frontendRoot, 'app', '__trellis_tmp')
const harnessHtml = path.join(tempPublicDir, 'mobile-single-mainline-harness.html')
const harnessModule = path.join(tempModuleDir, 'mobile-single-mainline-harness.jsx')
const viteConfig = path.join(tempModuleDir, 'vite-mobile-single-mainline.config.mjs')
const baseUrl = (process.env.MOBILE_SINGLE_MAINLINE_URL || 'http://127.0.0.1:5193').replace(/\/$/, '')
const evidenceDir = path.resolve(__dirname, 'evidence', '04-30-mobile-single-mainline-experience-visual-acceptance')
fs.mkdirSync(evidenceDir, { recursive: true })

function assert(condition, message, details) {
  if (!condition) {
    const error = new Error(message)
    if (details !== undefined) error.details = details
    throw error
  }
}

function writeHarness() {
  fs.mkdirSync(tempPublicDir, { recursive: true })
  fs.mkdirSync(tempModuleDir, { recursive: true })

  fs.writeFileSync(harnessHtml, `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Mobile Single Mainline Harness</title>
    <script type="module">
      import RefreshRuntime from "/@react-refresh"
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>
    <script type="module" src="/app/__trellis_tmp/mobile-single-mainline-harness.jsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`, 'utf8')

  fs.writeFileSync(harnessModule, `
import React from 'react'
import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router'
import '../styles.css'
import TavernRoute from '../routes/tavern'

const fixtureTavern = {
  id: 'mobile-single-mainline-demo',
  name: '雨巷灯塔酒馆',
  description: '真实街角坐标上的赛博酒馆入口，移动端先看入店主线。',
  lat: 31.2304,
  lon: 121.4737,
  address: '上海市 · 雨巷 23 号',
  owner_id: 'owner-demo',
  access: 'public',
  status: 'open',
  roleplay_mode: 'ai_only',
  layout_style: 'lobby',
  visit_count: 24,
  place_type: 'home',
  scene_prompt: '霓虹雨水沿着门牌滑落，吧台后有一盏温暖的灯。',
  skill_packs: [{ id: 'local-rumor', enabled: true }],
  home_members: [
    {
      id: 'lamp-cat',
      name: '灯下猫',
      display_name: '灯下猫',
      member_type: 'silent_member',
      speech_mode: 'silent',
      description: '店主确认的安静成员。',
    },
  ],
  characters: [
    {
      id: 'keeper',
      tavern_id: 'mobile-single-mainline-demo',
      name: '灯塔守夜人',
      description: '在雨巷尽头守着吧台的 NPC。',
      personality: '温和、谨慎、会提醒旅人把伞放好。',
      scenario: '真实坐标上的雨巷酒馆。',
      system_prompt: '保持非真人 NPC 角色设定，等待访客入店。',
      first_mes: '雨还没停，先在吧台边坐一会儿吧。',
      mes_example: '',
      tags: ['灯塔', '雨巷'],
    },
  ],
  world_info: [
    { id: 'rain-bell', keys: ['雨铃'], content: '雨铃响起时，附近会有传闻被带进酒馆。' },
  ],
  gameplay_definitions: [{ id: 'lantern-walk', title: '雨巷巡灯' }],
  character_claims: [
    { id: 'claim-demo', character_id: 'keeper', player_id: 'visitor-demo', player_name: 'Demo performer', status: 'pending' },
  ],
}

const fixtureRoleplay = {
  tavern_id: fixtureTavern.id,
  roleplay_mode: fixtureTavern.roleplay_mode,
  claims: fixtureTavern.character_claims,
  characters: fixtureTavern.characters.map((character) => ({ id: character.id, name: character.name })),
}

const router = createMemoryRouter([
  {
    path: '/tavern/:tavernId',
    Component: TavernRoute,
    loader: () => ({
      tavernId: fixtureTavern.id,
      tavern: fixtureTavern,
      roleplay: fixtureRoleplay,
      error: '',
    }),
  },
], {
  initialEntries: ['/tavern/mobile-single-mainline-demo'],
})

createRoot(document.getElementById('root')).render(<RouterProvider router={router} />)
`, 'utf8')

  fs.writeFileSync(viteConfig, `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 5193,
    strictPort: true,
  },
})
`, 'utf8')
}

function cleanupHarness() {
  for (const file of [harnessHtml, harnessModule, viteConfig]) {
    if (fs.existsSync(file)) fs.rmSync(file, { force: true })
  }
  try {
    if (fs.existsSync(tempPublicDir) && fs.readdirSync(tempPublicDir).length === 0) fs.rmdirSync(tempPublicDir)
    if (fs.existsSync(tempModuleDir) && fs.readdirSync(tempModuleDir).length === 0) fs.rmdirSync(tempModuleDir)
  } catch {}
}

function waitForServer(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = http.get(url, (response) => {
        response.resume()
        if (response.statusCode && response.statusCode < 500) resolve()
        else if (Date.now() > deadline) reject(new Error(`Vite harness server did not become ready: HTTP ${response.statusCode}`))
        else setTimeout(attempt, 250)
      })
      request.on('error', (error) => {
        if (Date.now() > deadline) reject(error)
        else setTimeout(attempt, 250)
      })
      request.setTimeout(1500, () => request.destroy(new Error('server readiness request timed out')))
    }
    attempt()
  })
}

async function startHarnessServer() {
  const viteBin = path.join(frontendRoot, 'node_modules', 'vite', 'bin', 'vite.js')
  const env = {
    ...process.env,
    NO_PROXY: '127.0.0.1,localhost',
    no_proxy: '127.0.0.1,localhost',
  }
  for (const key of ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']) delete env[key]
  const child = spawn(process.execPath, [
    viteBin,
    '--config',
    viteConfig,
    '--host=127.0.0.1',
    '--port=5193',
  ], {
    cwd: frontendRoot,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const logPath = path.join(evidenceDir, 'vite-harness.log')
  const logStream = fs.createWriteStream(logPath, { flags: 'a' })
  child.stdout.on('data', (chunk) => logStream.write(chunk))
  child.stderr.on('data', (chunk) => logStream.write(chunk))
  await waitForServer(`${baseUrl}/__trellis_tmp/mobile-single-mainline-harness.html`)
  return { child, logPath, logStream }
}

function stopHarnessServer(server) {
  if (!server?.child || server.child.killed) return
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(server.child.pid), '/T', '/F'], { stdio: 'ignore' })
  } else {
    server.child.kill('SIGTERM')
  }
  server.logStream?.end()
}

async function installApiMocks(page) {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (request.method() === 'GET' && url.pathname === '/api/v1/taverns/mobile-single-mainline-demo/share') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mobile-single-mainline-demo',
          name: '雨巷灯塔酒馆',
          description: '真实街角坐标上的赛博酒馆入口。',
          address: '上海市 · 雨巷 23 号',
          lat: 31.2304,
          lon: 121.4737,
          access: 'public',
          status: 'open',
          url: '/tavern/mobile-single-mainline-demo',
          characters: [{ id: 'keeper', name: '灯塔守夜人' }],
        }),
      })
    }
    if (request.method() === 'GET' && url.pathname === '/api/v1/rumors') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          rumors: [
            {
              id: 'rumor-mobile-single-mainline',
              source_tavern_id: 'mobile-single-mainline-demo',
              target_tavern_id: 'other-tavern',
              target_tavern_name: '隔壁灯箱',
              character_name: '灯塔守夜人',
              rumor_text: '隔壁灯箱今晚也亮着，但这里只保留酒馆内传闻，不做公共社交墙。',
              created_at: new Date().toISOString(),
            },
          ],
          count: 1,
        }),
      })
    }
    if (request.method() === 'POST' && url.pathname.startsWith('/api/v1/rumors/')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    })
  })
}

async function checkNoOverflow(page) {
  const overflow = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  assert(overflow.scrollWidth <= overflow.innerWidth + 2, 'page has horizontal overflow', overflow)
  return overflow
}

async function waitForAnyVisible(page, locator, message, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const count = await locator.count()
    for (let index = 0; index < count; index += 1) {
      if (await locator.nth(index).isVisible()) return
    }
    await page.waitForTimeout(250)
  }
  throw new Error(message)
}

async function mobileDockLabels(page) {
  return page.getByLabel('Mobile navigation').locator('a span').evaluateAll((nodes) =>
    nodes.map((node) => node.textContent?.trim()).filter(Boolean),
  )
}

async function runMobile(page) {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${baseUrl}/__trellis_tmp/mobile-single-mainline-harness.html`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })
  await page.getByRole('heading', { name: '雨巷灯塔酒馆', exact: true }).waitFor({ timeout: 15000 })
  await page.getByText('Mobile first-screen').waitFor({ timeout: 15000 })
  await page.getByText('先进入酒馆或查看主人入口').waitFor({ timeout: 15000 })
  await page.getByText('进入吧台').waitFor({ timeout: 15000 })
  await page.getByText('酒馆活性信号').waitFor({ timeout: 15000 })
  await page.getByText('更多酒馆信息').waitFor({ timeout: 15000 })

  const dock = page.getByLabel('Mobile navigation')
  await dock.waitFor({ timeout: 15000 })
  assert(await dock.isVisible(), 'mobile dock should be visible on narrow viewport')
  const labels = await mobileDockLabels(page)
  assert(
    JSON.stringify(labels) === JSON.stringify(['首页', '发现', '进店', '清单', '管理']),
    'mobile dock labels should follow visitor-first order',
    labels,
  )
  assert(!(await page.getByRole('link', { name: '创建空间' }).first().isVisible()), 'owner create wording should not be visible in mobile first-line navigation')
  assert(!(await page.getByText('也在附近开一间自己的酒馆').first().isVisible()), 'creator conversion card should be hidden on mobile')
  assert(!(await page.getByText('给店主的回访反馈').first().isVisible()), 'secondary feedback panel should be hidden before opening mobile details')

  await page.getByText('更多酒馆信息').click()
  await waitForAnyVisible(page, page.getByText('Home 成员与地点关系'), 'Home panel should be visible after opening mobile details')
  await waitForAnyVisible(page, page.getByText('给店主的回访反馈'), 'Visitor notes panel should be visible after opening mobile details')
  await waitForAnyVisible(page, page.getByText('邻里传闻'), 'Neighborhood rumor panel should be visible after opening mobile details')

  const overflow = await checkNoOverflow(page)
  const screenshotPath = path.join(evidenceDir, 'mobile-single-mainline-mobile.png')
  await page.screenshot({ path: screenshotPath, fullPage: true })
  return { screenshotPath, overflow }
}

async function runDesktop(page) {
  await page.setViewportSize({ width: 1366, height: 900 })
  await page.goto(`${baseUrl}/__trellis_tmp/mobile-single-mainline-harness.html`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })
  await page.getByRole('heading', { name: '雨巷灯塔酒馆', exact: true }).waitFor({ timeout: 15000 })
  assert(!(await page.getByLabel('Mobile navigation').isVisible()), 'mobile dock should be hidden on desktop')
  await page.getByRole('link', { name: /创建空间/ }).waitFor({ timeout: 15000 })
  await waitForAnyVisible(page, page.getByText('也在附近开一间自己的酒馆'), 'creator conversion card should be visible on desktop')
  await waitForAnyVisible(page, page.getByText('Home 成员与地点关系'), 'Home panel should be visible on desktop')
  await waitForAnyVisible(page, page.getByText('给店主的回访反馈'), 'Visitor notes panel should be visible on desktop')
  await waitForAnyVisible(page, page.getByText('邻里传闻'), 'Neighborhood rumor panel should be visible on desktop')

  const overflow = await checkNoOverflow(page)
  const screenshotPath = path.join(evidenceDir, 'mobile-single-mainline-desktop.png')
  await page.screenshot({ path: screenshotPath, fullPage: true })
  return { screenshotPath, overflow }
}

(async () => {
  writeHarness()
  let server = null
  const browser = await chromium.launch({ headless: true, args: ['--no-proxy-server'] })
  const context = await browser.newContext({ ignoreHTTPSErrors: true })
  const page = await context.newPage()
  const consoleSignals = []
  const requestFailures = []
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    if (text.includes('Failed to load resource') || text.includes('WebSocket')) return
    consoleSignals.push({ type: msg.type(), text })
  })
  page.on('pageerror', (error) => consoleSignals.push({ type: 'pageerror', text: String(error) }))
  page.on('requestfailed', (request) => {
    requestFailures.push({ url: request.url(), failure: request.failure()?.errorText || 'unknown' })
  })

  try {
    await installApiMocks(page)
    server = await startHarnessServer()
    const desktop = await runDesktop(page)
    const mobile = await runMobile(page)
    assert(consoleSignals.length === 0, 'browser console/page errors detected', consoleSignals)
    assert(requestFailures.length === 0, 'request failures detected', requestFailures)
    const report = {
      ok: true,
      baseUrl,
      evidenceDir,
      viteLog: server.logPath,
      desktop,
      mobile,
      consoleSignals,
      requestFailures,
      checked: [
        'actual ProductShell mobile dock labels/order',
        'desktop create entry remains visible while mobile owner/create wording is not first-line',
        'actual TavernRoute activity signals render before collapsed mobile details',
        'mobile secondary tavern panels are hidden until 更多酒馆信息 is opened',
        'creator conversion card is desktop-only',
        'desktop secondary panels remain visible',
        'no horizontal overflow on desktop/mobile',
      ],
    }
    const reportPath = path.join(evidenceDir, 'mobile-single-mainline-visual-acceptance-report.json')
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    console.log(JSON.stringify(report, null, 2))
  } catch (error) {
    const failurePath = path.join(evidenceDir, 'failure.png')
    try { await page.screenshot({ path: failurePath, fullPage: true }) } catch {}
    console.error('MOBILE_SINGLE_MAINLINE_VISUAL_ACCEPTANCE_FAILED')
    console.error(error.stack || error.message || String(error))
    if (error.details !== undefined) console.error('details:', JSON.stringify(error.details, null, 2))
    try { console.error('bodyText:', (await page.locator('body').innerText()).slice(0, 3000)) } catch {}
    console.error('failureScreenshot:', failurePath)
    process.exitCode = 1
  } finally {
    await context.close().catch(() => {})
    await browser.close().catch(() => {})
    stopHarnessServer(server)
    cleanupHarness()
  }
})()


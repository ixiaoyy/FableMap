const fs = require('fs')
const http = require('http')
const path = require('path')
const { spawn, spawnSync } = require('child_process')
const { chromium } = require('playwright')

const repoRoot = path.resolve(__dirname, '..', '..', '..')
const frontendRoot = path.join(repoRoot, 'frontend')
const tempPublicDir = path.join(frontendRoot, 'public', '__trellis_tmp')
const tempModuleDir = path.join(frontendRoot, 'app', '__trellis_tmp')
const harnessHtml = path.join(tempPublicDir, 'discovery-liveliness-harness.html')
const harnessModule = path.join(tempModuleDir, 'discovery-liveliness-harness.jsx')
const viteConfig = path.join(tempModuleDir, 'vite-harness.config.mjs')
const baseUrl = (process.env.DISCOVERY_LIVELINESS_URL || 'http://127.0.0.1:5192').replace(/\/$/, '')
const evidenceDir = path.resolve(__dirname, 'evidence', '04-30-discovery-liveliness-signals-rumor-guestbook-visual-acceptance')
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
    <title>Discovery Liveliness Harness</title>
    <script type="module">
      import RefreshRuntime from "/@react-refresh"
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>
    <script type="module" src="/app/__trellis_tmp/discovery-liveliness-harness.jsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`, 'utf8')

  fs.writeFileSync(harnessModule, `
import React from 'react'
import { createRoot } from 'react-dom/client'
import '../styles.css'
import { DiscoveryLivelinessStrip } from '../components/DiscoveryLivelinessStrip'

const livelyTavern = {
  id: 'lively-lantern',
  name: '巷口灯塔',
  visit_count: 24,
  characters: [{ id: 'keeper', name: '灯塔守夜人' }, { id: 'runner', name: '雨巷信使' }],
  gameplay_definitions: [{ id: 'ask-rumor' }],
  skill_packs: [{ id: 'local-rumor', enabled: true }],
}

const quietTavern = {
  id: 'quiet-door',
  name: '未亮起的门牌',
  visit_count: 0,
  characters: [],
  skill_packs: [],
}

function Harness() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <section className="mx-auto grid max-w-4xl gap-5">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/70">Discovery liveliness</p>
          <h1 className="mt-2 text-3xl font-black">发现页活性标签自验收</h1>
          <p className="mt-2 text-sm leading-6 text-violet-100/62">
            只展示传闻、回访反馈和聚合活动摘要；不渲染访客社交入口或竞争性排序。
          </p>
        </div>

        <article className="rounded-[1.75rem] border border-cyan-300/18 bg-slate-900/70 p-5">
          <h2 className="mb-3 text-xl font-black">活跃酒馆</h2>
          <DiscoveryLivelinessStrip tavern={livelyTavern} />
        </article>

        <article className="rounded-[1.75rem] border border-white/10 bg-slate-900/50 p-5">
          <h2 className="mb-3 text-xl font-black">新入口</h2>
          <DiscoveryLivelinessStrip tavern={quietTavern} compact />
        </article>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<Harness />)
`, 'utf8')

  fs.writeFileSync(viteConfig, `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 5192,
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
    '--port=5192',
  ], {
    cwd: frontendRoot,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const logPath = path.join(evidenceDir, 'vite-harness.log')
  const logStream = fs.createWriteStream(logPath, { flags: 'a' })
  child.stdout.on('data', (chunk) => logStream.write(chunk))
  child.stderr.on('data', (chunk) => logStream.write(chunk))
  await waitForServer(`${baseUrl}/__trellis_tmp/discovery-liveliness-harness.html`)
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

async function checkNoOverflow(page) {
  const overflow = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  assert(overflow.scrollWidth <= overflow.innerWidth + 2, 'page has horizontal overflow', overflow)
  return overflow
}

async function runViewport(page, viewport, screenshotName) {
  await page.setViewportSize(viewport)
  await page.goto(`${baseUrl}/__trellis_tmp/discovery-liveliness-harness.html`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })

  await page.getByRole('heading', { name: '发现页活性标签自验收' }).waitFor({ timeout: 15000 })
  await page.getByLabel('发现页活性信号').first().waitFor({ timeout: 15000 })
  await page.getByText('附近有人经营').waitFor({ timeout: 15000 })
  await page.getByText('环境传闻可用').waitFor({ timeout: 15000 })
  await page.getByText('回访反馈给店主').first().waitFor({ timeout: 15000 })
  await page.getByText('24 次到访').waitFor({ timeout: 15000 })
  await page.getByText('等待第一束灯').first().waitFor({ timeout: 15000 })

  const bodyText = await page.locator('body').innerText()
  for (const forbidden of ['好友', '私信', '公开访客墙', '全局社交图谱', '排行榜']) {
    assert(!bodyText.includes(forbidden), `forbidden social/ranking copy appeared: ${forbidden}`)
  }

  const overflow = await checkNoOverflow(page)
  const screenshotPath = path.join(evidenceDir, screenshotName)
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
    server = await startHarnessServer()
    const desktop = await runViewport(page, { width: 1366, height: 900 }, 'discovery-liveliness-desktop.png')
    const mobile = await runViewport(page, { width: 390, height: 844 }, 'discovery-liveliness-mobile.png')
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
        'Discovery liveliness strip renders active and quiet tavern states',
        'Rumor / owner-visible feedback / aggregate visit signals are visible',
        'Forbidden social/ranking copy is absent',
        'desktop/mobile screenshots captured',
        'no horizontal overflow on desktop/mobile',
      ],
    }
    const reportPath = path.join(evidenceDir, 'discovery-liveliness-visual-acceptance-report.json')
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    console.log(JSON.stringify(report, null, 2))
  } catch (error) {
    const failurePath = path.join(evidenceDir, 'failure.png')
    try { await page.screenshot({ path: failurePath, fullPage: true }) } catch {}
    console.error('DISCOVERY_LIVELINESS_VISUAL_ACCEPTANCE_FAILED')
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

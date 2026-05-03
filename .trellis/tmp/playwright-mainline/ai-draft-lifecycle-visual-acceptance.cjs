const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

const baseUrl = (process.env.AI_DRAFT_LIFECYCLE_URL || 'http://127.0.0.1:5173').replace(/\/$/, '')
const evidenceDir = path.resolve(__dirname, 'evidence', '04-30-ai-draft-lifecycle-status-ui-visual-acceptance')
fs.mkdirSync(evidenceDir, { recursive: true })

function assert(condition, message, details) {
  if (!condition) {
    const error = new Error(message)
    if (details !== undefined) error.details = details
    throw error
  }
}

function json(payload, status = 200) {
  return { status, contentType: 'application/json', body: JSON.stringify(payload) }
}

async function installApiMocks(page) {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (request.method() === 'GET' && url.pathname === '/api/v1/owners/me/default-llm') {
      return route.fulfill(json({
        configured: true,
        llm_config: {
          backend: 'openai',
          model: 'gpt-demo',
          api_key_configured: true,
          base_url: '',
          temperature: 0.7,
          max_tokens: 600,
          top_p: 1,
        },
      }))
    }
    if (request.method() === 'POST' && url.pathname === '/api/v1/owners/me/tavern-drafts/generate') {
      return route.fulfill(json({
        ok: true,
        draft: {
          name: '雨灯草稿酒馆',
          description: '一间等待店主确认的街角酒馆草稿。',
          scene_prompt: '雨后霓虹、木质吧台、真实坐标门牌。',
          character: {
            name: '灯叔',
            description: '只在店主保存后才成为正式 NPC。',
            first_mes: '伞先放门口，等你确认后我再开门。',
          },
        },
      }))
    }
    return route.fulfill(json({ error: `Unhandled mock route: ${request.method()} ${url.pathname}` }, 404))
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

async function runViewport(page, viewport, screenshotName) {
  await page.setViewportSize(viewport)
  await page.goto(`${baseUrl}/create`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.getByRole('heading', { name: 'AI 辅助草稿' }).waitFor({ timeout: 15000 })
  const lifecycle = page.getByLabel('AI 草稿生命周期').first()
  await lifecycle.waitFor({ timeout: 15000 })
  await lifecycle.getByText('酒馆草稿生命周期').waitFor({ timeout: 15000 })
  await lifecycle.getByText('AI 草稿', { exact: true }).waitFor({ timeout: 15000 })
  await lifecycle.getByText('店主待确认', { exact: true }).waitFor({ timeout: 15000 })
  await lifecycle.getByText('已发布内容', { exact: true }).waitFor({ timeout: 15000 })
  await lifecycle.getByText('确认前不进入公开 Tavern payload').waitFor({ timeout: 15000 })

  await page.locator('input[name="lat"]').fill('31.2304')
  await page.locator('input[name="lon"]').fill('121.4737')
  await page.locator('input[name="address"]').fill('上海 · 外滩')
  await page.getByRole('button', { name: '生成 AI 草稿' }).click()
  await page.getByText('草稿已生成并填入表单，你可以继续编辑后创建酒馆。').waitFor({ timeout: 15000 })
  await page.locator('input[name="name"]').evaluate((node) => {
    if (node.value !== '雨灯草稿酒馆') throw new Error(`draft did not fill tavern name: ${node.value}`)
  })
  await page.locator('input[name="character_name"]').evaluate((node) => {
    if (node.value !== '灯叔') throw new Error(`draft did not fill character name: ${node.value}`)
  })

  const bodyText = await page.locator('body').innerText()
  assert(!bodyText.includes('api_key'), 'create page should not expose raw api_key', bodyText)
  assert(bodyText.includes('不自动创建酒馆或 NPC'), 'draft guardrail should state no automatic creation', bodyText)
  assert(bodyText.includes('确认后再点击「创建酒馆」'), 'create page should gate persistence behind owner confirmation', bodyText)

  const overflow = await checkNoOverflow(page)
  const screenshotPath = path.join(evidenceDir, screenshotName)
  await page.screenshot({ path: screenshotPath, fullPage: true })
  return { screenshotPath, overflow }
}

(async () => {
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
    const desktop = await runViewport(page, { width: 1366, height: 900 }, 'ai-draft-lifecycle-create-desktop.png')
    const mobile = await runViewport(page, { width: 390, height: 844 }, 'ai-draft-lifecycle-create-mobile.png')
    assert(consoleSignals.length === 0, 'browser console/page errors detected', consoleSignals)
    assert(requestFailures.length === 0, 'request failures detected', requestFailures)
    const report = {
      ok: true,
      baseUrl,
      evidenceDir,
      desktop,
      mobile,
      consoleSignals,
      requestFailures,
      checked: [
        'create route loads',
        'AI draft lifecycle labels visible',
        'public payload/no automatic creation guardrails visible',
        'generate draft fills editable form only',
        'no raw api_key text',
        'no horizontal overflow on desktop/mobile',
      ],
    }
    const reportPath = path.join(evidenceDir, 'ai-draft-lifecycle-visual-acceptance-report.json')
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    console.log(JSON.stringify(report, null, 2))
  } catch (error) {
    const failurePath = path.join(evidenceDir, 'failure.png')
    try { await page.screenshot({ path: failurePath, fullPage: true }) } catch {}
    console.error('AI_DRAFT_LIFECYCLE_VISUAL_ACCEPTANCE_FAILED')
    console.error(error.stack || error.message || String(error))
    if (error.details !== undefined) console.error('details:', JSON.stringify(error.details, null, 2))
    try { console.error('bodyText:', (await page.locator('body').innerText()).slice(0, 3000)) } catch {}
    console.error('failureScreenshot:', failurePath)
    process.exitCode = 1
  } finally {
    await context.close().catch(() => {})
    await browser.close().catch(() => {})
  }
})()

const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

const baseUrl = (process.env.REVISIT_MEMORY_URL || 'http://127.0.0.1:5194').replace(/\/$/, '')
const tavernId = 'tavern-revisit'
const evidenceDir = path.resolve(__dirname, 'evidence', '04-30-revisit-memory-feedback-surface-visual-acceptance')
fs.mkdirSync(evidenceDir, { recursive: true })

const fixtureTavern = {
  id: tavernId,
  name: '回访验收酒馆',
  description: '一间挂在真实坐标上的赛博酒馆，NPC 会用既有访客状态延续回访线索。',
  address: '上海市黄浦区 Playwright 回访验收点',
  lat: 31.2304,
  lon: 121.4737,
  access: 'public',
  status: 'open',
  owner_id: 'owner-demo',
  layout_style: 'npc-chat',
  visit_count: 8,
  returning_visitor_count: 3,
  message_count: 24,
  rumor_count: 0,
  owner_visible_feedback_count: 1,
  characters: [
    {
      id: 'char-revisit',
      name: '记忆酒保',
      gender: 'unspecified',
      description: '负责记住回访者关系阶段的吧台 NPC。',
      personality: '温和、细心、不会泄露私密记忆。',
      scenario: '真实坐标上的深夜吧台。',
      first_mes: '欢迎回来，杯垫还在老位置。',
      tags: ['回访', '记忆'],
      avatar: '',
      sprites: {},
    },
  ],
  world_info: [
    { id: 'wi-revisit', keys: ['回访', '杯垫'], content: '店主确认的回访线索，只用于本酒馆上下文。' },
  ],
  gameplay_definitions: [],
}

const visitorState = {
  visitor_id: 'visitor-demo',
  tavern_id: tavernId,
  gender: 'unspecified',
  visit_count: 2,
  first_visit: '2026-05-01T10:00:00Z',
  last_visit: '2026-05-03T04:30:00Z',
  message_count: 6,
  relationship: { stage: 'friend', strength: 0.52 },
}

const ownerVisitors = [
  {
    tavern_id: tavernId,
    tavern_name: fixtureTavern.name,
    visitor_id: 'visitor-demo',
    visitor_name: '回访旅人',
    visit_count: 3,
    message_count: 9,
    last_visit: '2026-05-03T04:30:00Z',
    relationship: { stage: 'close_friend', strength: 0.75 },
  },
]

function assert(condition, message, details) {
  if (!condition) {
    const error = new Error(message)
    if (details !== undefined) error.details = details
    throw error
  }
}

function json(payload, status = 200) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(payload),
  }
}

async function installApiMocks(page) {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const pathname = url.pathname
    const method = request.method()

    if (method === 'GET' && pathname === `/api/v1/taverns/${tavernId}`) {
      return route.fulfill(json(fixtureTavern))
    }
    if (method === 'GET' && pathname === '/api/v1/taverns') {
      return route.fulfill(json({ taverns: [fixtureTavern], count: 1 }))
    }
    if (method === 'GET' && pathname === `/api/v1/taverns/${tavernId}/roleplay`) {
      return route.fulfill(json({
        tavern_id: tavernId,
        roleplay_mode: 'ai_only',
        claims: [],
        characters: fixtureTavern.characters.map(({ id, name, avatar }) => ({ id, name, avatar })),
      }))
    }
    if (method === 'GET' && pathname === `/api/v1/taverns/${tavernId}/share`) {
      return route.fulfill(json({
        tavern_id: tavernId,
        title: fixtureTavern.name,
        share_title: `邀请你进入「${fixtureTavern.name}」`,
        description: fixtureTavern.description,
        short_description: fixtureTavern.description,
        share_url: `${baseUrl}/tavern/${tavernId}`,
        location: { lat: fixtureTavern.lat, lon: fixtureTavern.lon },
        characters: fixtureTavern.characters.map(({ id, name, avatar }) => ({ id, name, avatar })),
      }))
    }
    if (method === 'POST' && pathname === `/api/v1/taverns/${tavernId}/enter`) {
      return route.fulfill(json({
        ok: true,
        first_mes: '记忆酒保点点头：我记得你上次说要带回旧照片。',
        visitor_state: visitorState,
      }))
    }
    if (method === 'POST' && pathname === `/api/v1/taverns/${tavernId}/chat`) {
      return route.fulfill(json({
        response: '记忆酒保轻声回应：我们继续从那张旧照片聊起。',
        visitor_state: { ...visitorState, relationship: { stage: 'friend', strength: 0.56 } },
      }))
    }
    if (method === 'GET' && pathname === `/api/v1/taverns/${tavernId}/visitors`) {
      return route.fulfill(json({ visitors: ownerVisitors, count: ownerVisitors.length }))
    }
    if (method === 'GET' && pathname === `/api/v1/taverns/${tavernId}/visitor-notes`) {
      return route.fulfill(json({
        notes: [
          {
            id: 'note-revisit',
            tavern_id: tavernId,
            visitor_id: 'visitor-demo',
            visitor_nickname: '回访旅人',
            content: '希望记忆酒保下次还记得我提到的旧照片。',
            created_at: '2026-05-03T04:40:00Z',
            visibility: 'owner_only',
          },
        ],
        count: 1,
      }))
    }
    if (method === 'GET' && pathname === '/api/v1/sessions') {
      return route.fulfill(json({
        chats: [
          {
            tavern_id: tavernId,
            tavern_name: fixtureTavern.name,
            visitor_id: 'visitor-demo',
            visitor_name: '回访旅人',
            character_id: 'char-revisit',
            character_name: '记忆酒保',
            message_count: 6,
            last_message: '还记得我上次说的旧照片吗？',
            last_role: 'user',
            updated_at: '2026-05-03T04:45:00Z',
          },
        ],
        count: 1,
      }))
    }
    if (method === 'GET' && pathname === '/api/v1/owners/me/default-llm') {
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
    if (method === 'GET' && pathname === `/api/v1/taverns/${tavernId}/metrics`) {
      return route.fulfill(json({
        tavern_id: tavernId,
        token_usage: { total: 420, history: [{ date: '2026-05-03', tokens: 120 }] },
        total_visits: 8,
        unique_visitors: 3,
        total_messages: 24,
        npc_rankings: [{ character_id: 'char-revisit', character_name: '记忆酒保', message_count: 24, last_interaction: '2026-05-03T04:45:00Z' }],
        peak_hours: [21, 22],
        peak_days: [{ date: '2026-05-03', visit_count: 3 }],
      }))
    }
    if (method === 'GET' && pathname === '/api/v1/rumors') {
      return route.fulfill(json({ rumors: [], count: 0 }))
    }
    if (method === 'POST' && pathname.startsWith('/api/v1/rumors/')) {
      return route.fulfill(json({ ok: true, view_count: 1, click_count: 1 }))
    }

    return route.fulfill(json({ error: `Unhandled mock route: ${method} ${pathname}` }, 404))
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

async function runTavernViewport(page, viewport, screenshotName) {
  await page.setViewportSize(viewport)
  await page.goto(`${baseUrl}/tavern/${tavernId}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.getByRole('heading', { name: /回访验收酒馆/ }).waitFor({ timeout: 15000 })
  await page.getByRole('heading', { name: '进入并对话' }).waitFor({ timeout: 15000 })
  await page.getByText('回访提示').first().waitFor({ timeout: 15000 })
  await page.getByRole('button', { name: '进入酒馆' }).click()
  await page.getByLabel('访客关系状态').waitFor({ timeout: 15000 })
  await page.getByText('朋友').first().waitFor({ timeout: 15000 })
  await page.getByText('2 次到访').first().waitFor({ timeout: 15000 })
  await page.getByText('关系 52%').first().waitFor({ timeout: 15000 })
  await page.getByText('欢迎回来，已第 2 次到访「回访验收酒馆」').waitFor({ timeout: 15000 })
  await page.getByText('关系上下文').first().waitFor({ timeout: 15000 })

  const bodyText = await page.locator('body').innerText()
  assert(!bodyText.includes('api_key'), 'tavern page should not expose raw api_key', bodyText)
  assert(!bodyText.includes('排行榜'), 'tavern page should not show ranking loop', bodyText)
  assert(bodyText.includes('不支持访客互相回复、点赞或私信') || viewport.width < 1024, 'feedback/social boundary should be visible on desktop', bodyText)

  const overflow = await checkNoOverflow(page)
  const screenshotPath = path.join(evidenceDir, screenshotName)
  await page.screenshot({ path: screenshotPath, fullPage: true })
  return { screenshotPath, overflow }
}

async function runOwnerViewport(page, viewport, screenshotName) {
  await page.setViewportSize(viewport)
  await page.goto(`${baseUrl}/owner?owner_id=owner-demo`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.getByRole('heading', { name: '店主经营摘要' }).waitFor({ timeout: 15000 })
  await page.getByRole('heading', { name: '重点回访者' }).waitFor({ timeout: 15000 })
  await page.getByText('回访旅人').first().waitFor({ timeout: 15000 })
  await page.getByText('挚友').first().waitFor({ timeout: 15000 })
  await page.getByText('关系 75%').first().waitFor({ timeout: 15000 })
  await page.getByText('最近会话').first().waitFor({ timeout: 15000 })
  await page.getByText('还记得我上次说的旧照片吗？').waitFor({ timeout: 15000 })
  await page.getByText('owner-visible notes').first().waitFor({ timeout: 15000 })

  const bodyText = await page.locator('body').innerText()
  assert(!bodyText.includes('api_key'), 'owner page should not expose raw api_key', bodyText)
  assert(!bodyText.includes('API Key：'), 'owner page should not display API key values', bodyText)
  assert(bodyText.includes('只汇总 owner-visible notes'), 'owner-visible feedback boundary should be explicit', bodyText)
  assert(bodyText.includes('不构成公开留言墙或访客社交'), 'owner route should state no public social-wall boundary', bodyText)

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
    const tavernDesktop = await runTavernViewport(page, { width: 1366, height: 900 }, 'revisit-tavern-desktop.png')
    const tavernMobile = await runTavernViewport(page, { width: 390, height: 844 }, 'revisit-tavern-mobile.png')
    const ownerDesktop = await runOwnerViewport(page, { width: 1366, height: 900 }, 'revisit-owner-desktop.png')
    const ownerMobile = await runOwnerViewport(page, { width: 390, height: 844 }, 'revisit-owner-mobile.png')

    assert(consoleSignals.length === 0, 'browser console/page errors detected', consoleSignals)
    assert(requestFailures.length === 0, 'request failures detected', requestFailures)

    const report = {
      ok: true,
      baseUrl,
      evidenceDir,
      tavernDesktop,
      tavernMobile,
      ownerDesktop,
      ownerMobile,
      consoleSignals,
      requestFailures,
      checked: [
        'tavern route loads',
        'visitor state summary appears after enter',
        'canonical friend label and 52% relationship strength visible',
        'returning revisit cue visible',
        'owner returning visitor panel uses close_friend label',
        'no raw api_key text',
        'no horizontal overflow on desktop/mobile',
      ],
    }
    const reportPath = path.join(evidenceDir, 'revisit-memory-visual-acceptance-report.json')
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    console.log(JSON.stringify(report, null, 2))
  } catch (error) {
    const failurePath = path.join(evidenceDir, 'failure.png')
    try { await page.screenshot({ path: failurePath, fullPage: true }) } catch {}
    console.error('REVISIT_MEMORY_VISUAL_ACCEPTANCE_FAILED')
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

import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(pathToFileURL(path.join(process.cwd(), 'frontend', 'package.json')))
const { chromium } = require('@playwright/test')

const evidenceDir = path.join(process.cwd(), '.trellis', 'tasks', '05-13-npc-fallback-memory-truthfulness', 'evidence')
await mkdir(evidenceDir, { recursive: true })

const baseURL = process.env.FABLEMAP_UI_BASE || 'http://127.0.0.1:5173'
const fallbackNotice = 'NPC 暂时无法给出有效回复，可以换个问法或稍后重试。'
const visitorState = {
  visitor_id: 'visitor-fallback-ui',
  tavern_id: 'pw_lantern_helpdesk',
  gender: 'unspecified',
  visit_count: 1,
  first_visit: '2026-05-13T00:00:00Z',
  last_visit: '2026-05-13T00:00:00Z',
  relationship: { strength: 0, stage: 'stranger' },
  metadata: {},
}
const character = {
  id: 'lamp',
  tavern_id: 'pw_lantern_helpdesk',
  name: '灯灯',
  description: '测试用 NPC。',
  personality: '温和。',
  scenario: '',
  gender: 'unspecified',
  first_mes: '你好，我是灯灯。',
  avatar: '',
  tags: [],
  hobbies: [],
  talkativeness: 0.5,
  sprites: {},
  appearance: {},
}
const tavern = {
  id: 'pw_lantern_helpdesk',
  name: '灯塔小馆',
  description: '用于验证 fallback 不展示虚假进度。',
  scene_prompt: '一间安静小馆。',
  owner_id: 'owner-fallback-ui',
  lat: 31.2304,
  lon: 121.4737,
  access: 'public',
  status: 'open',
  roleplay_mode: 'ai_only',
  layout_style: 'npc-chat',
  place_type: 'tavern',
  llm_config: { backend: 'rules', model: 'rules', api_key: '', base_url: '' },
  characters: [character],
  world_info: [],
  gameplay_definitions: [],
  group_chat_enabled: false,
  group_chat_config: {},
  memory_policy: { mode: 'structured' },
}

function json(route, payload, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json; charset=utf-8',
    body: JSON.stringify(payload),
  })
}

async function installApiMocks(page, captures) {
  await page.route('**/api/v1/**', async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    const pathname = url.pathname

    if (pathname === '/api/v1/taverns/pw_lantern_helpdesk/chat' && req.method() === 'POST') {
      captures.chatBody = JSON.parse(req.postData() || '{}')
      return json(route, {
        character_id: 'lamp',
        character_name: '灯灯',
        response: '灯灯点了点头，似乎在听你说话，但暂时没有更多回复。',
        is_fallback: true,
        fallback_notice: fallbackNotice,
        degraded: false,
        degradation: null,
        response_mode: { kind: 'owner_llm', label: '外部 LLM 模式' },
        tavern_status: 'open',
        visitor_state: visitorState,
        affinity: {
          strength: 0.2,
          previous_stage: 'stranger',
          new_stage: 'acquaintance',
          stage_label_zh: '陌生人',
          stage_changed: true,
        },
        created_memories: [{ id: 'fake-memory', content: '不应该展示的记忆' }],
        state_card_candidates: [{ id: 'fake-card', title: '不应该展示的线索' }],
        conflicts: [],
        timestamp: '2026-05-13T00:00:01Z',
      })
    }
    if (pathname === '/api/v1/taverns/pw_lantern_helpdesk/enter') {
      return json(route, { ok: true, first_mes: character.first_mes, visitor_state: visitorState, characters: [character] })
    }
    if (pathname === '/api/v1/taverns/pw_lantern_helpdesk/roleplay') {
      return json(route, { tavern_id: tavern.id, roleplay_mode: 'ai_only', claims: [], characters: [character] })
    }
    if (pathname === '/api/v1/taverns/pw_lantern_helpdesk/share') {
      return json(route, { title: tavern.name, summary: tavern.description, url: `${baseURL}/tavern/${tavern.id}`, copy_text: tavern.name })
    }
    if (pathname === '/api/v1/taverns/pw_lantern_helpdesk/group-chat') {
      return json(route, { tavern_id: tavern.id, group_chat_enabled: false, group_chat_config: {}, characters: [character], character_count: 1 })
    }
    if (pathname === '/api/v1/taverns/pw_lantern_helpdesk/gameplays') {
      return json(route, { gameplay_definitions: [] })
    }
    if (pathname === '/api/v1/taverns/pw_lantern_helpdesk/gameplay-sessions') {
      return json(route, { sessions: [], count: 0 })
    }
    if (pathname === '/api/v1/taverns/pw_lantern_helpdesk/chat') {
      return json(route, { messages: [] })
    }
    if (pathname === '/api/v1/taverns/pw_lantern_helpdesk') {
      return json(route, tavern)
    }
    if (pathname === '/api/v1/affinity/stages') {
      return json(route, { stages: [], count: 0 })
    }
    if (pathname.includes('/memory-atoms')) {
      return json(route, { memory_atoms: [], count: 0 })
    }
    if (pathname.includes('/state-cards')) {
      return json(route, { state_cards: [], count: 0 })
    }
    if (pathname.includes('/rumors')) {
      return json(route, { rumors: [], count: 0 })
    }
    if (pathname.includes('/engagement/config')) {
      return json(route, { coin_label: '纪念币', bonus_draw: { enabled: false, voucher_price: 30 } })
    }
    if (pathname.includes('/engagement')) {
      return json(route, { wallet: { balance: 0 }, coin_label: '纪念币', vouchers_available: 0, daily_earned: 0 })
    }
    if (pathname === '/api/v1/notifications') {
      return json(route, { notifications: [], unread_count: 0 })
    }
    return json(route, {})
  })
}

async function runCase(browser, name, viewport) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  const captures = {}
  const consoleMessages = []
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) {
      consoleMessages.push({ type: msg.type(), text: msg.text() })
    }
  })
  page.on('pageerror', (error) => {
    consoleMessages.push({ type: 'pageerror', text: error.message })
  })
  await installApiMocks(page, captures)
  await page.goto(`${baseURL}/tavern/pw_lantern_helpdesk?visitor_id=visitor-fallback-ui`, { waitUntil: 'networkidle' })
  await page.locator('form[data-chat-composer="fast-entry"] textarea').fill('@灯灯 你好')
  await page.locator('form[data-chat-composer="fast-entry"] button[type="submit"]').click()
  await page.getByText('灯灯点了点头').waitFor({ timeout: 8000 })
  await page.getByText(fallbackNotice).waitFor({ timeout: 8000 })
  const progressCardCount = await page.locator('[data-conversation-progress-card]').count()
  const fakeMemoryTextCount = await page.getByText(/记住了\s+\d+\s+件事/).count()
  if (progressCardCount !== 0) throw new Error(`${name}: fallback response rendered ${progressCardCount} progress cards`)
  if (fakeMemoryTextCount !== 0) throw new Error(`${name}: fallback response rendered memory progress text`)
  if (captures.chatBody?.character_id !== 'lamp') throw new Error(`${name}: expected chat character_id=lamp`)
  await page.screenshot({ path: path.join(evidenceDir, `fallback-no-progress-${name}.png`), fullPage: true })
  await context.close()
  return {
    name,
    viewport,
    progressCardCount,
    fakeMemoryTextCount,
    chatBody: captures.chatBody,
    consoleMessages,
  }
}

const browser = await chromium.launch()
try {
  const results = []
  results.push(await runCase(browser, 'desktop', { width: 1440, height: 1000 }))
  results.push(await runCase(browser, 'mobile', { width: 390, height: 844 }))
  await writeFile(
    path.join(evidenceDir, 'fallback-no-progress-browser-check.json'),
    JSON.stringify({ baseURL, checkedAt: new Date().toISOString(), results }, null, 2),
    'utf8',
  )
  console.log(JSON.stringify({ ok: true, results }, null, 2))
} finally {
  await browser.close()
}

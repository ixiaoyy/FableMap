import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium, expect } from '@playwright/test'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..')
const artifactDir = resolve(repoRoot, '.trellis', 'tasks', '05-07-05-07-chat-gameplay-variety-brainstorm', 'artifacts')
const baseUrl = process.env.FABLEMAP_BASE_URL || 'http://127.0.0.1:4173'
const tavernId = 'tavern-conversation-beats-demo'
const demoTavern = {
  id: tavernId,
  name: '回响巷子里的线索坊',
  description: '一间偏安静的空间，适合慢聊天。',
  address: '成都市高新区',
  status: 'open',
  access: 'public',
  owner_id: 'visitor-demo',
  lat: 30.66,
  lon: 104.06,
  local_time_display: '20:00',
  gameplay_definitions: [],
  characters: [
    {
      id: 'npc-glen',
      name: '格兰',
      description: '沉稳的主理人。',
      first_mes: '欢迎来到这里，我先听听你今天想聊什么。',
      scenario: '店内偏安静，NPC 以日常语气回应访客。',
    },
    {
      id: 'npc-cara',
      name: '卡拉',
      description: '喜欢发问的访客向导。',
      first_mes: '有线索要追，先把现有信息说清。',
      scenario: '喜欢把细节串成线索。',
    },
  ],
}

const sharePayload = {
  tavern_id: tavernId,
  title: demoTavern.name,
  description: demoTavern.description,
  short_description: demoTavern.description,
  cover: '',
  location: {
    lat: demoTavern.lat,
    lon: demoTavern.lon,
    address: demoTavern.address,
  },
  status: demoTavern.status,
  access: demoTavern.access,
  tags: [],
  characters: demoTavern.characters.map((character) => ({ id: character.id, name: character.name })),
  character_count: demoTavern.characters.length,
  share_url: `/tavern/${tavernId}`,
  share_title: demoTavern.name,
  share_text: `${demoTavern.name}（${demoTavern.description}）`,
}

const rumorList = {
  rumors: [
    {
      id: 'rumor-beats-01',
      source_tavern_id: tavernId,
      target_tavern_id: 'neighbor-demo',
      target_tavern_name: '邻里咖啡角',
      character_id: demoTavern.characters[0].id,
      character_name: demoTavern.characters[0].name,
      rumor_text: '邻里有一则线索，和本空间关系不大，但可在入口再看。',
      trigger_type: 'normal',
      trigger_keywords: ['线索', '入口'],
      weight: 1,
      created_at: '2026-05-07T07:00:00Z',
      expires_at: null,
      view_count: 0,
      click_count: 0,
    },
  ],
  count: 1,
}

const capturedPayloads = {
  chat: null,
}

function json(payload) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(payload),
  }
}

async function installApiFixtures(page) {
  await page.route('**/api/v1/taverns/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname

    if (path.endsWith(`/api/v1/taverns/${tavernId}/enter`) && request.method() === 'POST') {
      await route.fulfill(
        json({
          ok: true,
          first_mes: demoTavern.characters[0].first_mes,
          visitor_state: { visit_count: 1, first_visit: new Date().toISOString() },
        }),
      )
      return
    }

    if (path.endsWith(`/api/v1/taverns/${tavernId}`) && request.method() === 'GET') {
      await route.fulfill(json(demoTavern))
      return
    }

    if (path.endsWith(`/api/v1/taverns/${tavernId}/roleplay`) && request.method() === 'GET') {
      await route.fulfill(
        json({
          tavern_id: tavernId,
          roleplay_mode: 'ai_only',
          claims: [],
          characters: demoTavern.characters.map((character) => ({ id: character.id, name: character.name, avatar: character.avatar })),
          ok: true,
        }),
      )
      return
    }

    if (path.endsWith(`/api/v1/taverns/${tavernId}/share`) && request.method() === 'GET') {
      await route.fulfill(json(sharePayload))
      return
    }

    if (path.endsWith(`/api/v1/taverns/${tavernId}/chat`) && request.method() === 'POST') {
      capturedPayloads.chat = request.postDataJSON()
      await route.fulfill(
        json({
          character_id: demoTavern.characters[0].id,
          character_name: demoTavern.characters[0].name,
          response: '这轮对话里我记录到你在找“可继续追问的线索”。',
          affinity: {
            strength: 0.28,
            previous_stage: 'stranger',
            new_stage: 'acquaintance',
            stage_label_zh: '熟悉',
            stage_changed: true,
          },
          created_memories: [{ id: 'memory-1' }, { id: 'memory-2' }],
          state_card_candidates: [{ id: 'state-card-1' }],
        }),
      )
      return
    }

    if (path.endsWith(`/api/v1/taverns/${tavernId}/group-chat`) && request.method() === 'POST') {
      await route.fulfill(
        json({
          messages: [],
          speaker_count: 0,
          strategy: 'round_robin',
          visitor_state: {},
          affinity: {
            strength: 0.18,
            previous_stage: 'stranger',
            new_stage: 'stranger',
            stage_label_zh: '陌生',
          },
          created_memories: [],
          state_card_candidates: [],
        }),
      )
      return
    }

    await route.fulfill(json({ ok: true, message: 'mocked' }))
  })

  await page.route('**/api/v1/rumors**', (route) => {
    route.fulfill(json(rumorList))
  })
  await page.route('**/api/v1/rumors/*/view', (route) => route.fulfill(json({ ok: true, view_count: 1 })))
  await page.route('**/api/v1/rumors/*/click', (route) => route.fulfill(json({ ok: true, click_count: 1 })))

  await page.route('**/api/v1/taverns', (route) => {
    route.fulfill(json({ taverns: [demoTavern], count: 1 }))
  })
}

async function checkViewport(browser, viewport, isMobile) {
  const context = await browser.newContext({ viewport, isMobile: Boolean(isMobile), deviceScaleFactor: 1 })
  const page = await context.newPage()
  const label = `${viewport.width}x${viewport.height}${isMobile ? '-mobile' : '-desktop'}`

  await installApiFixtures(page)
  await page.goto(`${baseUrl}/tavern/${tavernId}?visitor_id=visitor-demo`, { waitUntil: 'networkidle' })

  const composer = page.locator('[data-chat-composer="fast-entry"]')
  const chips = page.locator('[data-conversation-intent-chips]')
  const card = page.locator('[data-conversation-progress-card]')

  await expect(chips).toBeVisible()
  await expect(composer).toBeVisible()
  await expect(page.locator('[aria-label=\"对话意图\"]')).toBeVisible()

  await expect(chips.getByRole("button", { name: "追问线索" })).toBeVisible()
  await chips.getByRole("button", { name: "追问线索" }).dispatchEvent("click")
  await composer.locator('textarea').fill('我先问你几个问题')
  await page.getByRole('button', { name: '发送' }).click()
  await expect.poll(() => capturedPayloads.chat !== null, { timeout: 5000 }).toBe(true)
  await expect(card).toBeVisible({ timeout: 6000 })

  const screenshotPath = resolve(artifactDir, `conversation-beats-${label}.png`)
  await page.screenshot({ path: screenshotPath, fullPage: true })

  await context.close()
  return { screenshotPath, label }
}

await mkdir(artifactDir, { recursive: true })
const browser = await chromium.launch()
const screenshots = []
try {
  screenshots.push(await checkViewport(browser, { width: 1440, height: 1020 }, false))
  screenshots.push(await checkViewport(browser, { width: 390, height: 900 }, true))
} finally {
  await browser.close()
}

const reportPath = resolve(artifactDir, 'conversation-beats-playwright-report.md')
const screenshotList = screenshots.map((item) => `- ${item.screenshotPath}`).join('\n')
const report = [
  '# Conversation beats Playwright Self Acceptance',
  '',
  `Date: 2026-05-07`,
  `Base URL: ${baseUrl}`,
  '',
  '## Assertions',
  '- 对话页 composer 与对话意图区块可见。',
  '- 选择对话意图后，输入后点击发送可触发回复。',
  '- 助手回复下方可见 `本轮有推进` 卡片。',
  '- 桌面与移动视口均成功截图。',
  '',
  '## Screenshots',
  screenshotList,
  '',
].join('\n')

await writeFile(reportPath, report, 'utf8')
console.log('conversation-beats-playwright-check: ok')
console.log(`report: ${reportPath}`)
for (const shot of screenshots) {
  console.log(`screenshot-${shot.label}: ${shot.screenshotPath}`)
}

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { createTavernService } from '../app/product/services/tavernService.js'
import {
  createShortDramaGameplayFromTemplate,
  isShortDramaCandidate,
  SHORT_DRAMA_GAMEPLAY_TEMPLATES,
} from '../app/product/shortDramaGameplayTemplates.js'

let captured = []
globalThis.fetch = async (url, options = {}) => {
  captured.push({ url: String(url), options })
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: async () => ({ ok: true, url: String(url) }),
    text: async () => '{"ok":true}',
  }
}

const service = createTavernService(() => 'http://unit.test')
await service.getGameplays('tavern one', 'visitor_a')
await service.saveGameplays('tavern one', [{ id: 'gp_one' }], 'owner_a')
await service.startGameplaySession('tavern one', { gameplayId: 'gp_one', characterId: 'char_one' }, 'visitor_a')
await service.advanceGameplaySession('tavern one', 'gps_one', { choiceId: 'go' }, 'visitor_a')
await service.listGameplaySessions('tavern one', { state: 'active' }, 'visitor_a')
await service.abandonGameplaySession('tavern one', 'gps_one', 'visitor_a')

assert.equal(captured.length, 6)
assert.ok(captured[0].url.includes('/api/v1/taverns/tavern%20one/gameplays'))
assert.equal(captured[1].options.method, 'PUT')
assert.ok(captured[2].url.includes('/gameplay-sessions'))
assert.equal(captured[3].options.method, 'POST')
assert.ok(captured[3].url.includes('/gameplay-sessions/gps_one/advance'))
assert.ok(captured[4].url.includes('state=active'))
assert.ok(captured[5].url.includes('/abandon'))

assert.equal(SHORT_DRAMA_GAMEPLAY_TEMPLATES.length, 4)
assert.deepEqual(SHORT_DRAMA_GAMEPLAY_TEMPLATES.map((template) => template.id), [
  'owner-rescue',
  'subtext-listener',
  'night-odd-guest',
  'truth-at-the-door',
])

for (const template of SHORT_DRAMA_GAMEPLAY_TEMPLATES) {
  assert.ok(template.title)
  assert.ok(template.summary)
  assert.ok(template.bestFor)
  assert.ok(Array.isArray(template.nodes))
  assert.ok(template.nodes.length >= 4)
  assert.ok(template.nodes.some((node) => Array.isArray(node.choices) && node.choices.length >= 2))
}

const shortDramaDraft = createShortDramaGameplayFromTemplate(SHORT_DRAMA_GAMEPLAY_TEMPLATES[0], 9)
assert.ok(shortDramaDraft.id.startsWith('gp_short_owner-rescue_'))
assert.equal(shortDramaDraft.status, 'draft')
assert.equal(shortDramaDraft.mode, 'ai_directed_branch')
assert.equal(shortDramaDraft.entry_label, '进入救场小剧场')
assert.equal(shortDramaDraft.completion.memory_atom.enabled, false)
assert.ok(shortDramaDraft.owner_brief.forbidden.includes('不使用广告复活、内购、排行、战斗、等级或装备系统'))
assert.ok(shortDramaDraft.owner_brief.forbidden.includes('不绕过店主确认自动发布剧情、NPC 或酒馆内容'))
assert.ok(isShortDramaCandidate(shortDramaDraft))

const shortDramaNodeIds = new Set(shortDramaDraft.nodes.map((node) => node.id))
assert.ok(shortDramaNodeIds.has('complete'))
for (const node of shortDramaDraft.nodes) {
  for (const choice of node.choices || []) {
    if (choice.next_node_id) assert.ok(shortDramaNodeIds.has(choice.next_node_id), `${choice.id} points to ${choice.next_node_id}`)
  }
  for (const event of node.fallback_events || []) {
    if (event.next_node_id) assert.ok(shortDramaNodeIds.has(event.next_node_id), `${event.id} points to ${event.next_node_id}`)
  }
}

const here = dirname(fileURLToPath(import.meta.url))
const managerSource = readFileSync(join(here, '../app/product/GameplayManager.jsx'), 'utf8')
assert.ok(managerSource.includes('GameplayDefinitionEditor'))
assert.ok(managerSource.includes('saveGameplays'))
assert.ok(managerSource.includes('published'))
assert.ok(managerSource.includes('disabled'))
assert.ok(managerSource.includes('SHORT_DRAMA_GAMEPLAY_TEMPLATES'))
assert.ok(managerSource.includes('只生成草稿，不会自动发布'))

const editorSource = readFileSync(join(here, '../app/product/GameplayDefinitionEditor.jsx'), 'utf8')
assert.ok(editorSource.includes('玩法名称'))
assert.ok(editorSource.includes('玩法目标'))
assert.ok(editorSource.includes('fallback_events'))
assert.ok(editorSource.includes('高级节点'))

const launcherSource = readFileSync(join(here, '../app/product/TavernGameplayLauncher.jsx'), 'utf8')
assert.ok(launcherSource.includes('onStart?.(gameplay)'))
assert.ok(launcherSource.includes('onResume?.(session)'))
assert.ok(launcherSource.includes('继续'))
assert.ok(launcherSource.includes('isShortDramaCandidate'))
assert.ok(launcherSource.includes('竖屏短剧感'))

const sessionPanelSource = readFileSync(join(here, '../app/product/GameplaySessionPanel.jsx'), 'utf8')
assert.ok(sessionPanelSource.includes('onChoice?.(choice)'))
assert.ok(sessionPanelSource.includes('onSubmit'))
assert.ok(sessionPanelSource.includes('onAbandon'))
assert.ok(sessionPanelSource.includes('completion'))
assert.ok(sessionPanelSource.includes('gameplay-session-panel__objective'))

const chatRoomSource = readFileSync(join(here, '../app/product/TavernChatRoom.jsx'), 'utf8')
assert.ok(chatRoomSource.includes('TavernGameplayLauncher'))
assert.ok(chatRoomSource.includes('GameplaySessionPanel'))
assert.ok(chatRoomSource.includes('startGameplaySession'))
assert.ok(chatRoomSource.includes('advanceGameplaySession'))
assert.ok(chatRoomSource.includes('activeGameplayDefinition'))

const ownerSource = readFileSync(join(here, '../app/product/TavernOwnerPanel.jsx'), 'utf8')
assert.ok(ownerSource.includes('GameplayManager'))

const styleSource = readFileSync(join(here, '../app/product/tavernGameplay.css'), 'utf8')
assert.ok(styleSource.includes('.tavern-gameplay-launcher'))
assert.ok(styleSource.includes('.gameplay-session-panel'))
assert.ok(styleSource.includes('.short-drama-template-grid'))
assert.ok(styleSource.includes('.gameplay-launch-card.is-drama'))

console.log('gameplay-test: ok')

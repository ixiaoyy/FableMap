import assert from 'node:assert/strict'

import { createTavernService } from '../app/product/services/tavernService.js'
import {
  OWNER_GAMEPLAY_TEMPLATE_CATEGORIES,
  OWNER_GAMEPLAY_TEMPLATES,
  createOwnerGameplayFromTemplate,
  filterOwnerGameplayTemplates,
} from '../app/product/ownerGameplayTemplates.js'
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

assert.deepEqual(
  captured.map((entry) => entry.options.method || 'GET'),
  ['GET', 'PUT', 'POST', 'POST', 'GET', 'POST'],
  'gameplay service should use expected HTTP methods',
)
assert.ok(captured.every((entry) => entry.url.includes('/api/v1/taverns/tavern%20one/')), 'gameplay service should stay under tavern API routes')
assert.ok(captured[3].url.includes('/gameplay-sessions/gps_one/advance') && captured[5].url.includes('/abandon'))

const ownerIds = OWNER_GAMEPLAY_TEMPLATES.map((template) => template.id)
assert.equal(new Set(ownerIds).size, ownerIds.length, 'owner gameplay template ids should be unique')
assert.ok(OWNER_GAMEPLAY_TEMPLATES.length >= 10, 'owner should have a useful template library')
assert.ok(
  OWNER_GAMEPLAY_TEMPLATES.every(
    (template) =>
      template.title &&
      template.summary &&
      template.bestFor &&
      OWNER_GAMEPLAY_TEMPLATE_CATEGORIES.includes(template.category) &&
      Array.isArray(template.nodes) &&
      template.nodes.length >= 3 &&
      !/战斗|等级|装备|排行|交易奖励/.test(`${template.title}${template.summary}`),
  ),
  'owner gameplay templates should keep required fields and avoid excluded game systems',
)

const ownerTemplateDraft = createOwnerGameplayFromTemplate(OWNER_GAMEPLAY_TEMPLATES[0], 7)
assert.equal(ownerTemplateDraft.status, 'draft')
assert.equal(ownerTemplateDraft.mode, 'ai_directed_branch')
assert.equal(ownerTemplateDraft.completion.memory_atom.enabled, false)
assert.ok(ownerTemplateDraft.owner_brief.forbidden.includes('不绕过店主确认自动发布剧情、NPC 或空间内容'))
assert.ok(ownerTemplateDraft.nodes.some((node) => node.id === 'complete'))
assert.deepEqual(filterOwnerGameplayTemplates({ category: '线索' }).map((template) => template.id), ['three-step-clue-ledger'])
assert.ok(filterOwnerGameplayTemplates({ query: '医院' }).some((template) => template.id === 'kindness-checklist'))

const shortDramaIds = SHORT_DRAMA_GAMEPLAY_TEMPLATES.map((template) => template.id)
assert.deepEqual(shortDramaIds, ['owner-rescue', 'subtext-listener', 'night-odd-guest', 'truth-at-the-door'])
assert.ok(
  SHORT_DRAMA_GAMEPLAY_TEMPLATES.every(
    (template) => template.title && template.summary && Array.isArray(template.nodes) && template.nodes.some((node) => Array.isArray(node.choices) && node.choices.length >= 2),
  ),
  'short-drama templates should keep playable branching nodes',
)

const shortDramaDraft = createShortDramaGameplayFromTemplate(SHORT_DRAMA_GAMEPLAY_TEMPLATES[0], 9)
assert.equal(shortDramaDraft.status, 'draft')
assert.equal(shortDramaDraft.completion.memory_atom.enabled, false)
assert.ok(shortDramaDraft.owner_brief.forbidden.includes('不使用广告复活、内购、排行、战斗、等级或装备系统'))
assert.ok(isShortDramaCandidate(shortDramaDraft))

const shortDramaNodeIds = new Set(shortDramaDraft.nodes.map((node) => node.id))
assert.ok(shortDramaNodeIds.has('complete'))
for (const node of shortDramaDraft.nodes) {
  for (const targetId of [...(node.choices || []), ...(node.fallback_events || [])].map((item) => item.next_node_id).filter(Boolean)) {
    assert.ok(shortDramaNodeIds.has(targetId), `${node.id} points to missing node ${targetId}`)
  }
}

console.log('gameplay-test: ok')

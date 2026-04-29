import assert from 'node:assert/strict'
import { buildQuestGuideSummary, PLATFORM_QUEST_GUIDES } from '../app/lib/quest-guide.js'

const taverns = [
  {
    id: 'tavern_open',
    name: '灯下小馆',
    status: 'open',
    access: 'public',
    owner_id: 'owner-demo',
    characters: [{ id: 'npc_a' }, { id: 'npc_b' }],
    gameplay_definitions: [{ id: 'gp_a', status: 'published' }],
  },
  {
    id: 'tavern_second',
    name: '咖啡邮局',
    status: 'open',
    access: 'public',
    owner_id: 'other-owner',
    characters: [{ id: 'npc_c' }],
  },
  {
    id: 'tavern_private',
    name: '私人房间',
    status: 'open',
    access: 'private',
    owner_id: 'owner-demo',
    characters: [{ id: 'npc_private' }],
  },
]

assert.ok(PLATFORM_QUEST_GUIDES.length >= 5, 'should provide at least five platform guide quests')
assert.ok(PLATFORM_QUEST_GUIDES.every((quest) => quest.ctaTo && quest.ctaLabel), 'each guide quest needs a CTA')
assert.ok(PLATFORM_QUEST_GUIDES.every((quest) => !/获得.*等级|装备奖励|竞技排行榜|Token 充值|平台充值/.test(`${quest.title}${quest.description}`)), 'guide quests must avoid forbidden RPG/billing scope')

const summary = buildQuestGuideSummary({ taverns, ownerId: 'owner-demo' })
assert.equal(summary.metrics.taverns, 3, 'counts visible taverns from loader')
assert.equal(summary.metrics.openTaverns, 2, 'private taverns should not count as public/open quest targets')
assert.equal(summary.metrics.npcCount, 3, 'counts NPCs in public open taverns')
assert.equal(summary.metrics.questPlayTaverns, 1, 'detects published gameplay taverns')
assert.equal(summary.metrics.ownerTaverns, 2, 'counts owner taverns for creation guide')

const firstVisit = summary.quests.find((quest) => quest.id === 'visit-first-open-tavern')
assert.equal(firstVisit.status, 'completed', 'first open tavern guide can complete when an open public tavern exists')
assert.equal(firstVisit.progress, 1, 'completed guide progress caps at 1')

const tour = summary.quests.find((quest) => quest.id === 'tour-three-open-taverns')
assert.equal(tour.status, 'in_progress', 'three tavern tour should remain in progress with two open taverns')
assert.equal(tour.current, 2, 'tour current progress should reflect open public taverns')

const empty = buildQuestGuideSummary({ taverns: [], ownerId: 'owner-demo' })
assert.equal(empty.completedCount, 0, 'empty world has no completed guide quests')
assert.ok(empty.quests.every((quest) => quest.status === 'available'), 'empty world guide quests are available')

console.log('quest-guide-test: ok')

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
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
assert.ok(PLATFORM_QUEST_GUIDES.some((quest) => quest.description.includes('回访提示') || quest.description.includes('不引入战斗')), 'guide copy should state checklist boundaries and revisit-oriented feedback')
assert.ok(PLATFORM_QUEST_GUIDES.every((quest) => !Object.hasOwn(quest, 'targetCount')), 'exploration guides must not define pseudo completion targets')
assert.ok(PLATFORM_QUEST_GUIDES.every((quest) => quest.signalLabel && typeof quest.measure === 'function'), 'each exploration guide should expose a data signal instead of progress math')

const summary = buildQuestGuideSummary({ taverns, ownerId: 'owner-demo' })
assert.equal(summary.metrics.taverns, 3, 'counts visible taverns from loader')
assert.equal(summary.metrics.openTaverns, 2, 'private taverns should not count as public/open quest targets')
assert.equal(summary.metrics.npcCount, 3, 'counts NPCs in public open taverns')
assert.equal(summary.metrics.questPlayTaverns, 1, 'detects published gameplay taverns')
assert.equal(summary.metrics.ownerTaverns, 2, 'counts owner taverns for creation guide')

const firstVisit = summary.quests.find((quest) => quest.id === 'visit-first-open-tavern')
assert.equal(firstVisit.availability, 'ready', 'first open tavern guide should be ready when an open public tavern exists')
assert.equal(firstVisit.signalCount, 2, 'guide signal reflects available public/open taverns without becoming saved progress')
assert.ok(firstVisit.helperText.includes('回访提示'), 'guide feedback remains revisit-oriented rather than reward-oriented')
assert.ok(!Object.hasOwn(firstVisit, 'progress'), 'guide cards must not expose progress values')
assert.ok(!Object.hasOwn(firstVisit, 'status'), 'guide cards must not expose completion status')
assert.ok(!Object.hasOwn(firstVisit, 'target'), 'guide cards must not expose completion targets')

const tour = summary.quests.find((quest) => quest.id === 'tour-three-open-taverns')
assert.equal(tour.availability, 'ready', 'multi-space guide should stay a guide card, not an in-progress task')
assert.equal(tour.signalCount, 2, 'tour guide can show current available signal count without progress wording')

const empty = buildQuestGuideSummary({ taverns: [], ownerId: 'owner-demo' })
assert.equal(empty.readyGuideCount, 0, 'empty world has no ready guide cards')
assert.ok(empty.quests.every((quest) => quest.availability === 'guide'), 'empty world guide cards remain suggestions')
assert.ok(empty.quests.every((quest) => quest.helperText.includes('回访提示') || quest.helperText.includes('真实坐标')), 'available guide copy should explain safe next steps')
assert.ok(!Object.hasOwn(empty, 'completedCount'), 'summary must not expose pseudo completed counts')
assert.ok(!Object.hasOwn(empty, 'activeCount'), 'summary must not expose pseudo active counts')

const here = dirname(fileURLToPath(import.meta.url))
const routeSource = readFileSync(join(here, '../app/routes/quests.tsx'), 'utf8')
const shellSource = readFileSync(join(here, '../app/shell/product-shell.tsx'), 'utf8')
const layoutSource = readFileSync(join(here, '../app/lib/tavern-layouts.js'), 'utf8')

assert.ok(routeSource.includes('<ProductShell eyebrow="Guide">'), '/quests route should use guide framing')
assert.ok(routeSource.includes('探索指南'), '/quests route should show exploration guide copy')
assert.doesNotMatch(routeSource, /探索任务板|引导任务|访客排名|进度估算|当前引导状态|已满足|待探索|rawCurrent|formatPercent|statusLabel|rewardText|完成后显示|文字纪念章/)
assert.ok(shellSource.includes('{ to: "/quests", label: "指南"'), 'global navigation should label /quests as guide')
assert.ok(shellSource.includes('探索指南只提供下一步建议'), 'mobile guide should show no-progress boundary')
assert.ok(layoutSource.includes('探索 / 玩法型'), 'layout option should be reframed from task to exploration')

console.log('quest-guide-test: ok')

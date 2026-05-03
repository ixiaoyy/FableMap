import { buildOwnerOperatingSummary, formatRelationshipStage } from '../app/lib/owner-summary.js'

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`)
  }
}

function testSummaryMetricsAndHighlights() {
  const taverns = [
    { id: 'tavern_a', name: '夜雨柜台', status: 'open', characters: [{ id: 'char_a', name: '阿柜' }] },
    { id: 'tavern_b', name: '晨光邮局', status: 'closed', characters: [{ id: 'char_b', name: '邮差' }] },
  ]
  const visitors = [
    {
      tavern_id: 'tavern_a',
      tavern_name: '夜雨柜台',
      visitor_id: 'visitor_alpha',
      visitor_name: 'Alpha',
      visit_count: 3,
      message_count: 12,
      last_visit: '2026-04-27T08:30:00Z',
      relationship: { stage: 'regular', strength: 0.74 },
    },
    {
      tavern_id: 'tavern_a',
      tavern_name: '夜雨柜台',
      visitor_id: 'visitor_beta',
      visitor_name: 'Beta',
      visit_count: 1,
      message_count: 2,
      last_visit: '2026-04-26T18:10:00Z',
      relationship: { stage: 'stranger', strength: 0.2 },
    },
    {
      tavern_id: 'tavern_b',
      tavern_name: '晨光邮局',
      visitor_id: 'visitor_gamma',
      visitor_name: '',
      visit_count: 2,
      message_count: 0,
      last_visit: '2026-04-25T12:00:00Z',
      relationship: { stage: 'acquaintance', strength: 0.42 },
    },
  ]
  const sessions = [
    {
      tavern_id: 'tavern_a',
      tavern_name: '夜雨柜台',
      visitor_id: 'visitor_alpha',
      visitor_name: 'Alpha',
      character_id: 'char_a',
      character_name: '阿柜',
      message_count: 8,
      last_message: '还记得我上次说的蓝莓派吗？',
      last_role: 'user',
      updated_at: '2026-04-27T09:00:00Z',
    },
    {
      tavern_id: 'tavern_b',
      tavern_name: '晨光邮局',
      visitor_id: 'visitor_gamma',
      visitor_name: '',
      character_id: 'char_b',
      character_name: '邮差',
      message_count: 3,
      last_message: '欢迎下次再来。',
      last_role: 'assistant',
      updated_at: '2026-04-26T10:00:00Z',
    },
  ]
  const visitorNotes = [
    {
      id: 'note_1',
      tavern_id: 'tavern_a',
      tavern_name: '夜雨柜台',
      visitor_id: 'visitor_alpha',
      visitor_nickname: 'Alpha',
      content: '希望阿柜下次还记得我喜欢靠窗的位置。',
      created_at: '2026-04-27T10:00:00Z',
      visibility: 'owner_only',
    },
  ]

  const summary = buildOwnerOperatingSummary({
    taverns,
    visitors,
    sessions,
    visitorNotes,
    ownerLLM: { configured: false, llm_config: null },
  })

  assertEqual(summary.metrics.taverns, 2, 'counts taverns')
  assertEqual(summary.metrics.openTaverns, 1, 'counts open taverns')
  assertEqual(summary.metrics.visitors, 3, 'counts unique visitors')
  assertEqual(summary.metrics.returningVisitors, 2, 'counts returning visitors')
  assertEqual(summary.metrics.engagedVisitors, 2, 'counts engaged visitors')
  assertEqual(summary.metrics.sessions, 2, 'counts chat sessions')
  assertEqual(summary.metrics.messages, 11, 'sums session messages')
  assertEqual(summary.metrics.visitorNotes, 1, 'counts owner-visible visitor notes')
  assertEqual(summary.metrics.llmConfigured, false, 'reports missing owner default LLM')

  assertEqual(summary.returningHighlights[0].visitorLabel, 'Alpha', 'sorts strongest returning visitor first')
  assertEqual(summary.tavernHighlights[0].tavernName, '夜雨柜台', 'sorts tavern with most owner feedback first')
  assert(summary.recentSessions[0].lastMessage.includes('蓝莓派'), 'keeps recent visible session message')
  assert(summary.latestFeedback[0].content.includes('靠窗'), 'keeps latest owner-visible visitor feedback')
  assert(summary.nextActions.some((item) => item.kind === 'follow_up_returning'), 'suggests following up with returning visitors')
  assert(summary.nextActions.some((item) => item.kind === 'configure_owner_llm'), 'suggests configuring owner default LLM')
  assert(summary.nextActions.some((item) => item.kind === 'review_owner_visible_feedback'), 'suggests reviewing owner-visible feedback')
  assert(summary.nextActions.some((item) => item.kind === 'reopen_closed'), 'suggests reopening closed taverns')
}

function testEmptySummaryHasOnboardingAction() {
  const summary = buildOwnerOperatingSummary({ taverns: [], visitors: [], sessions: [] })
  assertEqual(summary.metrics.taverns, 0, 'empty tavern count')
  assertEqual(summary.returningHighlights.length, 0, 'empty returning highlights')
  assert(summary.nextActions.some((item) => item.kind === 'create_first_tavern'), 'suggests first tavern creation')
}

function testConfiguredLlmDoesNotSuggestSetup() {
  const summary = buildOwnerOperatingSummary({
    taverns: [{ id: 'tavern_ai', name: 'AI 柜台', status: 'open' }],
    visitors: [],
    sessions: [],
    visitorNotes: [],
    ownerLLM: { configured: true, llm_config: { backend: 'openai', model: 'gpt-test', api_key_configured: true } },
  })

  assertEqual(summary.metrics.llmConfigured, true, 'reports configured owner default LLM')
  assertEqual(summary.metrics.llmBackend, 'openai', 'keeps safe LLM backend label')
  assertEqual(summary.metrics.llmModel, 'gpt-test', 'keeps safe LLM model label')
  assert(!summary.nextActions.some((item) => item.kind === 'configure_owner_llm'), 'does not suggest LLM setup when configured')
}

function testRelationshipStageLabelsUseAffinityNames() {
  assertEqual(formatRelationshipStage('stranger'), '陌生人', 'formats stranger affinity stage')
  assertEqual(formatRelationshipStage('acquaintance'), '点头之交', 'formats acquaintance affinity stage')
  assertEqual(formatRelationshipStage('familiar'), '熟面孔', 'formats familiar affinity stage')
  assertEqual(formatRelationshipStage('friend'), '朋友', 'formats friend affinity stage')
  assertEqual(formatRelationshipStage('close_friend'), '挚友', 'formats close friend affinity stage')
  assertEqual(formatRelationshipStage('best_friend'), '知己', 'formats best friend affinity stage')
  assertEqual(formatRelationshipStage('regular'), '熟面孔', 'normalizes legacy regular stage')
  assertEqual(formatRelationshipStage('confidant'), '挚友', 'normalizes legacy confidant stage')
  assertEqual(formatRelationshipStage('', 0.52), '朋友', 'falls back to relationship strength when stage is missing')
  assertEqual(formatRelationshipStage('unknown-stage'), '陌生人', 'unknown stage falls back to safe affinity label')
}

testSummaryMetricsAndHighlights()
testEmptySummaryHasOnboardingAction()
testConfiguredLlmDoesNotSuggestSetup()
testRelationshipStageLabelsUseAffinityNames()

console.log('owner-summary-test: ok')

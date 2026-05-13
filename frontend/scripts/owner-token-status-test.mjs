import assert from 'node:assert/strict'

import {
  OWNER_TOKEN_REFERENCE_BOUNDARIES,
  buildOwnerTokenStats,
  createOwnerTokenRow,
  formatOwnerTokenUnits,
  getOwnerTokenUsage,
} from '../app/product/ownerTokenStatus.js'

const sampleTaverns = [
  { id: 'tavern_low', name: '街角小馆', status: 'open', llm_config: { backend: 'openai', model: 'gpt-4o-mini', api_key: 'owner-api-key-placeholder', token_used: 1200 } },
  { id: 'tavern_none', name: '未配置空间', status: 'closed', llm_config: { backend: '', api_key: 'sk-hidden', token_used: -5 } },
  { id: 'tavern_high', name: '月台茶室', status: 'open', llm_config: { backend: 'openrouter', model: 'anthropic/claude-haiku', api_key_configured: true, token_used: 12800 } },
]

assert.deepEqual([getOwnerTokenUsage(sampleTaverns[0]), getOwnerTokenUsage(sampleTaverns[1]), formatOwnerTokenUnits(0), formatOwnerTokenUnits(1200), formatOwnerTokenUnits(1250000)], [1200, 0, '—', '1.2K', '1.25M'])
const row = createOwnerTokenRow(sampleTaverns[0])
assert.deepEqual({ tavernId: row.tavernId, configured: row.configured, usageLabel: row.usageLabel, leaksKey: JSON.stringify(row).includes('sk-') || Object.hasOwn(row, 'api_key') }, { tavernId: 'tavern_low', configured: true, usageLabel: '已有参考记录', leaksKey: false })

const stats = buildOwnerTokenStats(sampleTaverns)
assert.deepEqual({ total: stats.total, average: stats.average, usedCount: stats.usedCount, unusedCount: stats.unusedCount, configuredCount: stats.configuredCount, unconfiguredCount: stats.unconfiguredCount, topTavernName: stats.topTavernName, order: stats.rows.map((item) => item.tavernId) }, { total: 14000, average: 4667, usedCount: 2, unusedCount: 1, configuredCount: 2, unconfiguredCount: 1, topTavernName: '月台茶室', order: ['tavern_high', 'tavern_low', 'tavern_none'] })
assert.ok(!JSON.stringify(stats).includes('sk-hidden') && ['仅供店主参考', '不展示 API Key', '不含充值、结算或抽成', '访客不可见账单'].every((text) => OWNER_TOKEN_REFERENCE_BOUNDARIES.includes(text)))

console.log('owner-token-status-test: ok')

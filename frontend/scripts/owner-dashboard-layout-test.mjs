import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const route = readFileSync(new URL('../app/routes/owner.tsx', import.meta.url), 'utf8')
const summary = readFileSync(new URL('../app/lib/owner-summary.js', import.meta.url), 'utf8')

assert(route.includes('NotificationBell'), 'owner route should expose notification entry point')
assert(route.includes('getOwnerDefaultLLM'), 'owner route should read safe owner default LLM status')
assert(route.includes('listVisitorNotes'), 'owner route should aggregate owner-visible visitor notes')
assert(route.includes('开店 / AI 草稿辅助'), 'owner route should expose create / AI draft CTA')
assert(route.includes('owner-visible notes'), 'owner route should clarify feedback is owner-visible, not public social')
assert(route.includes('grid gap-3 sm:grid-cols-2'), 'owner route hero CTAs should use mobile-safe wrapping grid')
assert(route.includes('min-h-36') || route.includes('min-h-40'), 'owner route should include designed empty states')
assert(!route.includes('api_key'), 'owner route must not display owner API keys')
assert(!route.includes('排行榜'), 'owner route must not introduce ranking/social gamification copy')

assert(summary.includes('visitorNotes'), 'owner summary should accept visitorNotes input')
assert(summary.includes('llmConfigured'), 'owner summary should produce safe LLM configured metric')
assert(summary.includes('review_owner_visible_feedback'), 'owner summary should recommend reviewing owner-visible feedback')
assert(summary.includes('configure_owner_llm'), 'owner summary should recommend default AI configuration when missing')

console.log('owner-dashboard-layout-test: ok')

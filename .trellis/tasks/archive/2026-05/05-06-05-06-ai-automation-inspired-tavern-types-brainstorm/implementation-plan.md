# AI Automation Inspired Tavern Intents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an owner-confirmed “经营意图模板层” so FableMap taverns can be configured around 6 concrete visitor needs without changing `place_type`, backend schema, payment, social, or platform-generated publish boundaries.

**Architecture:** Keep `place_type` as the real-world location type. Add a frontend-only intent catalog that feeds the create wizard, owner gameplay template library, and discovery/search labels using existing tavern payload fields (`characters`, `gameplay_definitions`, `skill_packs`, `scene_prompt`, `place_type`). All generated or template-derived content remains a draft or owner-confirmed UI suggestion.

**Tech Stack:** React Router route modules (`frontend/app/routes/*.tsx`), frontend product JS helpers (`frontend/app/product/*.js`), Node source/regression scripts under `frontend/scripts/`, existing `npm --prefix .\frontend test` and `npm --prefix .\frontend run build`.

---

## Scope and boundaries

- No backend/API/schema migration in this plan.
- No new `PlaceType`/`place_type` values.
- No external CRM, RAG, workflow automation connector, payment, booking, marketing, visitor feed, ranking, combat, levels, equipment, or token settlement.
- No platform auto-publishing of tavern descriptions, NPCs, world info, gameplay, images, or presets.
- Every UI change must preserve real coordinates/address copy and owner confirmation copy.

## File structure

- Create `frontend/app/product/tavernIntentTemplates.js`
  - Single source for 6 top-level intent templates.
  - Exports catalog constants and pure helper functions for lookup/search/copy.
- Modify `frontend/app/routes/create.tsx`
  - Adds a visual “经营意图” selector after physical place type.
  - Uses active intent copy in preview/AI draft helper without submitting schema-breaking fields.
- Modify `frontend/app/product/ownerGameplayTemplates.js`
  - Adds lightweight draft gameplay templates aligned to the 6 intents.
  - Keeps shared forbidden guardrails.
- Create `frontend/app/lib/tavern-intent-tags.js`
  - Derives safe public intent chips/search text from existing tavern payload only.
- Modify `frontend/app/routes/discover.tsx`
  - Adds safe intent search/chip rendering in discovery cards/radar without social/ranking behavior.
- Create `frontend/scripts/tavern-intent-templates-test.mjs`
  - Tests catalog shape, forbidden boundaries, helper behavior, and create-route integration markers.
- Modify `frontend/scripts/gameplay-test.mjs`
  - Updates expected owner gameplay template IDs/count/categories.
- Create `frontend/scripts/tavern-intent-tags-test.mjs`
  - Tests discovery intent derivation uses only existing public fields and forbidden copy is absent.
- Modify `frontend/package.json`
  - Adds the two new Node tests to `scripts.test`.
- Update `.trellis/tasks/05-06-05-06-ai-automation-inspired-tavern-types-brainstorm/prd.md`
  - Record implementation evidence and verification output.

---

### Task 1: Intent template catalog and source-level tests

**Files:**
- Create: `frontend/app/product/tavernIntentTemplates.js`
- Create: `frontend/scripts/tavern-intent-templates-test.mjs`
- Modify: `frontend/package.json`

- [ ] **Step 1: Write the failing catalog test**

Create `frontend/scripts/tavern-intent-templates-test.mjs` with this content:

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  TAVERN_INTENT_FORBIDDEN_COPY,
  TAVERN_INTENT_TEMPLATES,
  deriveTavernIntent,
  getTavernIntentSearchText,
} from '../app/product/tavernIntentTemplates.js'

const expectedIds = [
  'workflow-clinic',
  'industry-desk',
  'needs-counter',
  'archive-study',
  'creation-workshop',
  'companion-beacon',
]

assert.deepEqual(TAVERN_INTENT_TEMPLATES.map((intent) => intent.id), expectedIds)

for (const intent of TAVERN_INTENT_TEMPLATES) {
  assert.equal(typeof intent.title, 'string')
  assert.equal(typeof intent.summary, 'string')
  assert.equal(typeof intent.primaryNpcRole, 'string')
  assert.ok(Array.isArray(intent.visitorInputs) && intent.visitorInputs.length >= 2)
  assert.ok(Array.isArray(intent.ownerConfigFocus) && intent.ownerConfigFocus.length >= 2)
  assert.ok(Array.isArray(intent.verifiableOutputs) && intent.verifiableOutputs.length >= 2)
  assert.ok(Array.isArray(intent.guardrails) && intent.guardrails.length >= 2)
  const joined = JSON.stringify(intent)
  for (const forbidden of TAVERN_INTENT_FORBIDDEN_COPY) {
    assert(!joined.includes(forbidden), `intent ${intent.id} must not include forbidden copy: ${forbidden}`)
  }
}

assert.equal(deriveTavernIntent('workflow-clinic').id, 'workflow-clinic')
assert.equal(deriveTavernIntent('unknown').id, 'companion-beacon')
assert.match(getTavernIntentSearchText(deriveTavernIntent('archive-study')), /档案/)
assert.match(getTavernIntentSearchText(deriveTavernIntent('creation-workshop')), /创作/)

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageJson = readFileSync(resolve(__dirname, '../package.json'), 'utf8')
assert.match(packageJson, /tavern-intent-templates-test\.mjs/)

console.log('tavern-intent-templates-test: ok')
```

- [ ] **Step 2: Add the test command and verify it fails**

Modify `frontend/package.json` by adding this command into the existing `scripts.test` chain after `create-wizard-route-test.mjs`:

```json
node ./scripts/tavern-intent-templates-test.mjs
```

Run:

```powershell
npm --prefix .\frontend test -- --runInBand
```

Expected: the test chain fails because `../app/product/tavernIntentTemplates.js` does not exist.

- [ ] **Step 3: Implement the catalog helper**

Create `frontend/app/product/tavernIntentTemplates.js`:

```js
export const TAVERN_INTENT_FORBIDDEN_COPY = [
  '平台自动发布',
  '自动生成并上线',
  '充值',
  '结算',
  '排行榜',
  '等级',
  '装备',
  '群发营销',
  '访客社交',
]

export const TAVERN_INTENT_TEMPLATES = [
  {
    id: 'workflow-clinic',
    title: '流程诊所',
    badge: '理清流程',
    summary: '帮访客把重复流程拆成现状、卡点和下一步清单。',
    primaryNpcRole: '流程诊断师',
    tone: '务实、追问关键事实、不替访客做最终业务决策。',
    visitorInputs: ['现在谁处理', '用什么表或工具', '哪里最容易出错'],
    ownerConfigFocus: ['流程提问脚本', '输出清单格式', '不接真实业务系统'],
    verifiableOutputs: ['现状流程摘要', '卡点列表', '下一步小清单'],
    guardrails: ['只做整理和建议', '不承诺节省成本', '不连接 CRM/表格自动执行'],
    keywords: ['流程', '自动化', '卡点', 'SOP'],
  },
  {
    id: 'industry-desk',
    title: '行业工位',
    badge: '垂直助手',
    summary: '给招聘、教培、房产、跨境等场景一个熟悉材料的 NPC 助手。',
    primaryNpcRole: '行业资料整理员',
    tone: '熟悉业务语境、标出风险、需要人工复核。',
    visitorInputs: ['岗位/JD/房源/课程信息', '目标对象', '需要整理的材料片段'],
    ownerConfigFocus: ['行业 WorldInfo', '风险提示', '人工转接话术'],
    verifiableOutputs: ['材料目录', '风险清单', '跟进草稿'],
    guardrails: ['不做医疗/法律/投资结论', '不做招聘录拒决定', '不索取敏感证件'],
    keywords: ['行业', '招聘', '教培', '房产', '跨境'],
  },
  {
    id: 'needs-counter',
    title: '需求吧台',
    badge: '表达需求',
    summary: '帮访客把模糊请求说清楚，让店主获得可处理摘要。',
    primaryNpcRole: '需求采集员',
    tone: '温和、结构化、尊重隐私，不做骚扰营销。',
    visitorInputs: ['想解决什么', '时间/预算/限制', '希望店主如何回应'],
    ownerConfigFocus: ['需求摘要格式', '隐私边界', '店主可见记录说明'],
    verifiableOutputs: ['需求摘要', '下一步建议', '人工跟进便签'],
    guardrails: ['不公开访客记录', '不群发营销', '不买卖线索'],
    keywords: ['需求', '咨询', '吧台', '前台'],
  },
  {
    id: 'archive-study',
    title: '档案书房',
    badge: '找资料',
    summary: '用 owner-confirmed 知识帮助访客找到、理解和复用资料。',
    primaryNpcRole: '档案管理员',
    tone: '引用清楚、边界清楚、不泄露私有资料。',
    visitorInputs: ['想找的资料', '遇到的流程问题', '需要复核的条款/段落'],
    ownerConfigFocus: ['WorldInfo 条目', '引用规则', '不可见资料边界'],
    verifiableOutputs: ['引用式回答', '资料位置', '待人工复核项'],
    guardrails: ['不泄露 owner 私有资料', '不编造引用', '不替代专业审查'],
    keywords: ['档案', '知识库', 'SOP', '资料'],
  },
  {
    id: 'creation-workshop',
    title: '创作/交付工坊',
    badge: '整理草稿',
    summary: '把 brief、素材或想法整理成大纲、清单和可审稿草稿。',
    primaryNpcRole: '方案架构师',
    tone: '鼓励创作、保留店主审核、不自动发布。',
    visitorInputs: ['创作主题', '素材/会议纪要', '目标格式'],
    ownerConfigFocus: ['输出模板', '审稿清单', '发布前确认'],
    verifiableOutputs: ['提案大纲', '分镜/清单', '审稿问题'],
    guardrails: ['只生成草稿', '不自动发布', '不冒充客户最终交付'],
    keywords: ['创作', '交付', 'brief', '方案', '短剧'],
  },
  {
    id: 'companion-beacon',
    title: '陪伴灯塔',
    badge: '低风险陪伴',
    summary: '面向夜归、社区、公益和医院陪伴场景，提供善意清单与现实求助边界。',
    primaryNpcRole: '值班陪伴员',
    tone: '温柔、克制、低风险、明确现实求助边界。',
    visitorInputs: ['现在的压力', '想留给下次自己的话', '今天能做的一件小事'],
    ownerConfigFocus: ['现实求助边界', '回访规则', '不追问隐私'],
    verifiableOutputs: ['善意清单', '回访便签', '现实求助提醒'],
    guardrails: ['不替代医疗心理服务', '不追问敏感隐私', '紧急情况指向现实支持'],
    keywords: ['陪伴', '公益', '夜归', '医院', '回访'],
  },
]

const INTENT_BY_ID = new Map(TAVERN_INTENT_TEMPLATES.map((intent) => [intent.id, intent]))

export function deriveTavernIntent(value = 'companion-beacon') {
  const id = String(value || '').trim()
  return INTENT_BY_ID.get(id) || INTENT_BY_ID.get('companion-beacon')
}

export function getTavernIntentSearchText(intent) {
  if (!intent) return ''
  return [
    intent.title,
    intent.badge,
    intent.summary,
    intent.primaryNpcRole,
    intent.tone,
    ...(intent.visitorInputs || []),
    ...(intent.ownerConfigFocus || []),
    ...(intent.verifiableOutputs || []),
    ...(intent.guardrails || []),
    ...(intent.keywords || []),
  ].filter(Boolean).join(' ')
}
```

- [ ] **Step 4: Run the focused test**

Run:

```powershell
node .\frontend\scripts\tavern-intent-templates-test.mjs
```

Expected: `tavern-intent-templates-test: ok`.

- [ ] **Step 5: Commit this slice**

```powershell
git add frontend/app/product/tavernIntentTemplates.js frontend/scripts/tavern-intent-templates-test.mjs frontend/package.json
git commit -m "feat: add tavern intent template catalog"
```

---

### Task 2: Create wizard intent selector

**Files:**
- Modify: `frontend/app/routes/create.tsx`
- Modify: `frontend/scripts/create-wizard-route-test.mjs`

- [ ] **Step 1: Add failing create-route assertions**

Append these assertions to `frontend/scripts/create-wizard-route-test.mjs` before the final `console.log`:

```js
assert.ok(route.includes('TAVERN_INTENT_TEMPLATES'), 'create route should import the tavern intent catalog')
assert.ok(route.includes('activeIntent'), 'create route should derive active intent preview copy')
assert.ok(route.includes('data-tavern-intent-selector'), 'create route should render a dedicated intent selector')
assert.ok(route.includes('data-tavern-intent-card'), 'create route should render selectable intent cards')
assert.ok(route.includes('经营意图'), 'create route should label intent as owner-confirmed business/visitor need, not physical place_type')
assert.ok(route.includes('不改 place_type / Schema'), 'create route should state that intent templates do not change place_type or schema')
assert.ok(!route.includes('name="intent_type"'), 'create route must not submit a new schema field for intent type')
assert.ok(!route.includes('place_type: activeIntent'), 'create route must not overwrite physical place_type with intent')
```

Run:

```powershell
node .\frontend\scripts\create-wizard-route-test.mjs
```

Expected: FAIL because create route has no intent catalog UI yet.

- [ ] **Step 2: Import and state the active intent**

In `frontend/app/routes/create.tsx`, add this import near other product/helper imports:

```ts
import { TAVERN_INTENT_TEMPLATES, deriveTavernIntent } from "../product/tavernIntentTemplates.js"
```

Add state after `activePlaceTypeName` is defined:

```ts
  const [intentId, setIntentId] = useState("companion-beacon")
  const activeIntent = deriveTavernIntent(intentId)
  const activeIntentChecklist = [
    activeIntent.primaryNpcRole,
    ...(activeIntent.verifiableOutputs || []).slice(0, 2),
  ]
```

- [ ] **Step 3: Render the intent selector after the place type section**

After the existing place-type `<section className="space-y-3 rounded-[1.75rem]...">...</section>`, insert:

```tsx
              <section data-tavern-intent-selector className="space-y-3 rounded-[1.75rem] border border-fuchsia-300/14 bg-fuchsia-300/[0.035] p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-white">经营意图</p>
                    <p className="mt-1 text-xs leading-5 text-violet-100/50">
                      这里选择“这间空间主要帮访客完成什么”；它不改 place_type / Schema，也不会绕过店主确认发布内容。
                    </p>
                  </div>
                  <span className="inline-flex w-fit rounded-full border border-fuchsia-300/24 bg-fuchsia-300/10 px-3 py-1.5 text-xs font-bold text-fuchsia-50">
                    {activeIntent.badge}
                  </span>
                </div>
                <div className="grid gap-2 lg:grid-cols-2">
                  {TAVERN_INTENT_TEMPLATES.map((intent) => {
                    const active = intentId === intent.id
                    return (
                      <button
                        key={intent.id}
                        type="button"
                        data-tavern-intent-card={intent.id}
                        onClick={() => setIntentId(intent.id)}
                        aria-pressed={active}
                        className={`min-h-28 touch-manipulation rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${
                          active
                            ? "border-fuchsia-300/34 bg-fuchsia-300/12 text-fuchsia-50 shadow-[0_0_28px_rgba(217,70,239,0.13)]"
                            : "border-white/10 bg-slate-950/45 text-violet-100/64 hover:border-white/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-100/70">{intent.badge}</span>
                        <span className="mt-2 block text-sm font-black text-white">{intent.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-violet-100/58">{intent.summary}</span>
                        <span className="mt-2 block text-[0.7rem] leading-5 text-cyan-100/68">核心 NPC：{intent.primaryNpcRole}</span>
                      </button>
                    )
                  })}
                </div>
              </section>
```

- [ ] **Step 4: Connect intent copy to the right preview**

In the AI draft panel title/helper area, keep physical place type visible and add a short intent line below the existing helper paragraph:

```tsx
                <p className="text-xs text-violet-100/60">按当前地点类型生成可丢弃草稿</p>
                <p className="mt-1 text-xs text-fuchsia-100/72">经营意图：{activeIntent.title} · {activeIntent.summary}</p>
```

In the first NPC preview card, change the helper text to include `activeIntent.primaryNpcRole`:

```tsx
                  先写一个能接待{activePlaceTypeName}访客的角色；当前建议角色是「{activeIntent.primaryNpcRole}」。
```

In the checklist card near the bottom of the aside, render `activeIntentChecklist` as additional rows if the file already maps checklist arrays. If there is no existing checklist loop, add a small intent card:

```tsx
          <div className="rounded-[2rem] border border-fuchsia-300/16 bg-fuchsia-300/[0.045] p-5 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-100/70">经营意图预览</p>
            <h2 className="mt-2 text-lg font-black text-white">{activeIntent.title}</h2>
            <p className="mt-2 text-sm leading-6 text-violet-100/62">{activeIntent.summary}</p>
            <ul className="mt-3 grid gap-2 text-xs leading-5 text-violet-100/64">
              {activeIntentChecklist.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
```

- [ ] **Step 5: Run focused create-route test**

Run:

```powershell
node .\frontend\scripts\create-wizard-route-test.mjs
```

Expected: `create-wizard-route-test: ok`.

- [ ] **Step 6: Commit this slice**

```powershell
git add frontend/app/routes/create.tsx frontend/scripts/create-wizard-route-test.mjs
git commit -m "feat: add create wizard tavern intent selector"
```

---

### Task 3: Owner gameplay templates for the 6 intents

**Files:**
- Modify: `frontend/app/product/ownerGameplayTemplates.js`
- Modify: `frontend/scripts/gameplay-test.mjs`

- [ ] **Step 1: Update failing gameplay expectations**

In `frontend/scripts/gameplay-test.mjs`, replace the owner template count and ID assertion with:

```js
assert.equal(OWNER_GAMEPLAY_TEMPLATES.length, 10)
assert.deepEqual(OWNER_GAMEPLAY_TEMPLATES.map((template) => template.id), [
  'three-step-clue-ledger',
  'returning-note',
  'kindness-checklist',
  'quiet-object-reading',
  'workflow-clinic-checkup',
  'industry-material-triage',
  'needs-counter-brief',
  'archive-study-lookup',
  'creation-workshop-outline',
  'companion-beacon-return-note',
])
```

Add this assertion after the existing forbidden-copy loop over templates:

```js
for (const template of OWNER_GAMEPLAY_TEMPLATES.slice(4)) {
  assert.ok(['流程', '行业', '需求', '资料', '创作', '陪伴'].includes(template.category))
  assert.ok(template.summary.includes('不') || template.goal.includes('不'), `${template.id} should include an explicit boundary`)
}
```

Run:

```powershell
node .\frontend\scripts\gameplay-test.mjs
```

Expected: FAIL because the new templates do not exist.

- [ ] **Step 2: Extend categories**

In `frontend/app/product/ownerGameplayTemplates.js`, change:

```js
export const OWNER_GAMEPLAY_TEMPLATE_CATEGORIES = ['全部', '线索', '回访', '陪伴', '观察']
```

to:

```js
export const OWNER_GAMEPLAY_TEMPLATE_CATEGORIES = ['全部', '线索', '回访', '陪伴', '观察', '流程', '行业', '需求', '资料', '创作']
```

- [ ] **Step 3: Append the 6 intent gameplay templates**

Append six template objects to `OWNER_GAMEPLAY_TEMPLATES` after `quiet-object-reading`. Each object must include `id`, `category`, `badge`, `title`, `duration`, `bestFor`, `entryLabel`, `summary`, `goal`, `tone`, `materials`, `rewardText`, and at least 3 nodes ending in `complete`.

Use this exact shape for the first template and mirror the same node discipline for the other five:

```js
  {
    id: 'workflow-clinic-checkup',
    category: '流程',
    badge: '流程',
    title: '三步流程问诊',
    duration: '5-8 分钟',
    bestFor: '流程诊所、行业工位、店主管理台',
    entryLabel: '开始流程问诊',
    summary: '把一个重复流程拆成现状、卡点和下一步清单；不连接真实业务系统。',
    goal: '帮助访客描述流程现状、识别一个卡点，并形成低风险下一步。',
    tone: '务实、追问事实、不承诺收益或自动化效果。',
    materials: ['流程便签', '交接表', '错误样例', '下一步清单'],
    rewardText: '流程没有被自动改掉，但下一步已经写清楚。',
    nodes: [
      {
        id: 'start',
        title: '描述流程',
        prompt: '请访客说明这个流程从谁开始、经过哪些材料、最后交给谁。',
        choices: [{ id: 'find_blocker', label: '找最卡的一步', next_node_id: 'blocker' }],
      },
      {
        id: 'blocker',
        title: '卡点定位',
        prompt: '帮访客挑出一个高频出错或最耗人的环节，不给自动化承诺。',
        choices: [{ id: 'next_step', label: '写下一步', next_node_id: 'next_step' }],
      },
      {
        id: 'next_step',
        title: '下一步清单',
        prompt: '给出一个今天能验证的小动作和一个需要人工确认的问题。',
        choices: [{ id: 'complete', label: '归档流程问诊', next_node_id: 'complete' }],
      },
      { id: 'complete', title: '问诊完成', prompt: '用三句话总结现状、卡点和下一步。', choices: [] },
    ],
  }
```

For the remaining five template IDs, use these required summaries and categories:

```js
'industry-material-triage' -> category '行业', summary includes '只做材料整理/风险提示，不做最终专业判断。'
'needs-counter-brief' -> category '需求', summary includes '形成店主可读摘要，不公开访客记录或群发营销。'
'archive-study-lookup' -> category '资料', summary includes '基于店主确认资料做引用式整理，不编造资料来源。'
'creation-workshop-outline' -> category '创作', summary includes '把 brief 整理成草稿大纲，不自动发布或替代最终交付。'
'companion-beacon-return-note' -> category '陪伴', summary includes '整理善意清单和回访便签，不替代医疗心理服务。'
```

- [ ] **Step 4: Run gameplay test**

Run:

```powershell
node .\frontend\scripts\gameplay-test.mjs
```

Expected: `gameplay-test: ok`.

- [ ] **Step 5: Commit this slice**

```powershell
git add frontend/app/product/ownerGameplayTemplates.js frontend/scripts/gameplay-test.mjs
git commit -m "feat: add intent-based gameplay templates"
```

---

### Task 4: Discovery intent chips using existing payload fields

**Files:**
- Create: `frontend/app/lib/tavern-intent-tags.js`
- Create: `frontend/scripts/tavern-intent-tags-test.mjs`
- Modify: `frontend/app/routes/discover.tsx`
- Modify: `frontend/package.json`

- [ ] **Step 1: Write failing derivation test**

Create `frontend/scripts/tavern-intent-tags-test.mjs`:

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildTavernIntentTags, getTavernIntentTagsSearchText } from '../app/lib/tavern-intent-tags.js'

const workflowTags = buildTavernIntentTags({
  characters: [{ name: '流程诊断师', tags: ['流程'] }],
  gameplay_definitions: [{ id: 'gp_template_workflow-clinic-checkup_1', title: '三步流程问诊', summary: '流程诊所' }],
})

assert(workflowTags.some((tag) => tag.id === 'workflow-clinic'))
assert.match(getTavernIntentTagsSearchText(workflowTags), /流程诊所/)

const emptyTags = buildTavernIntentTags({})
assert.deepEqual(emptyTags, [])

const forbiddenJoined = JSON.stringify(buildTavernIntentTags({
  gameplay_definitions: [{ title: '招聘驿站', summary: '材料整理' }],
}))
for (const forbidden of ['排行榜', '等级', '装备', '群发营销', '访客社交', '充值', '结算']) {
  assert(!forbiddenJoined.includes(forbidden), `intent tags must not expose forbidden copy: ${forbidden}`)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const discoverSource = readFileSync(resolve(__dirname, '../app/routes/discover.tsx'), 'utf8')
assert.match(discoverSource, /buildTavernIntentTags/)
assert.match(discoverSource, /getTavernIntentTagsSearchText/)
assert.match(discoverSource, /经营意图/)

const packageJson = readFileSync(resolve(__dirname, '../package.json'), 'utf8')
assert.match(packageJson, /tavern-intent-tags-test\.mjs/)

console.log('tavern-intent-tags-test: ok')
```

Add `node ./scripts/tavern-intent-tags-test.mjs` to `frontend/package.json` test chain after `tavern-intent-templates-test.mjs`.

Run:

```powershell
node .\frontend\scripts\tavern-intent-tags-test.mjs
```

Expected: FAIL because helper does not exist.

- [ ] **Step 2: Implement public-safe intent tags helper**

Create `frontend/app/lib/tavern-intent-tags.js`:

```js
const INTENT_TAGS = [
  { id: 'workflow-clinic', label: '流程诊所', keywords: ['流程', 'workflow-clinic', '流程问诊', 'SOP'] },
  { id: 'industry-desk', label: '行业工位', keywords: ['行业', 'industry', '招聘', '教培', '房产', '跨境'] },
  { id: 'needs-counter', label: '需求吧台', keywords: ['需求', 'needs-counter', '咨询', '前台'] },
  { id: 'archive-study', label: '档案书房', keywords: ['档案', 'archive', '知识库', '资料', 'SOP'] },
  { id: 'creation-workshop', label: '创作工坊', keywords: ['创作', 'creation', 'brief', '方案', '短剧'] },
  { id: 'companion-beacon', label: '陪伴灯塔', keywords: ['陪伴', 'companion', '公益', '回访', '医院'] },
]

function collectPublicText(tavern = {}) {
  return [
    tavern.name,
    tavern.description,
    tavern.scene_prompt,
    ...(tavern.characters || []).flatMap((character) => [character.name, character.description, ...(character.tags || [])]),
    ...(tavern.gameplay_definitions || []).flatMap((gameplay) => [gameplay.id, gameplay.title, gameplay.summary, gameplay.entry_label]),
    ...(tavern.skill_packs || []).flatMap((pack) => [pack.id, pack.title, pack.summary]),
  ].filter((value) => typeof value === 'string').join(' ').toLowerCase()
}

export function buildTavernIntentTags(tavern = {}) {
  const text = collectPublicText(tavern)
  if (!text) return []
  return INTENT_TAGS.filter((tag) => tag.keywords.some((keyword) => text.includes(keyword.toLowerCase())))
    .slice(0, 2)
    .map((tag) => ({ ...tag, helper: '店主确认的帮助意图' }))
}

export function getTavernIntentTagsSearchText(tags = []) {
  return tags.map((tag) => `${tag.label} ${tag.helper}`).join(' ')
}
```

- [ ] **Step 3: Wire helper into discover search and cards**

In `frontend/app/routes/discover.tsx`, add import:

```ts
import { buildTavernIntentTags, getTavernIntentTagsSearchText } from "../lib/tavern-intent-tags.js"
```

In `tavernSearchText`, add:

```ts
    getTavernIntentTagsSearchText(buildTavernIntentTags(tavern)),
```

In the result/radar card rendering area where chips/signals are displayed, render at most two chips:

```tsx
              {buildTavernIntentTags(tavern).length ? (
                <div className="mt-3 flex flex-wrap gap-2" aria-label="经营意图">
                  {buildTavernIntentTags(tavern).map((tag) => (
                    <span key={tag.id} className="rounded-full border border-fuchsia-300/22 bg-fuchsia-300/10 px-2.5 py-1 text-[0.7rem] font-bold text-fuchsia-50">
                      {tag.label}
                    </span>
                  ))}
                </div>
              ) : null}
```

If both radar and card views have separate components, add the block to the main result card first and only add to radar if space remains readable.

- [ ] **Step 4: Run focused test**

Run:

```powershell
node .\frontend\scripts\tavern-intent-tags-test.mjs
```

Expected: `tavern-intent-tags-test: ok`.

- [ ] **Step 5: Commit this slice**

```powershell
git add frontend/app/lib/tavern-intent-tags.js frontend/app/routes/discover.tsx frontend/scripts/tavern-intent-tags-test.mjs frontend/package.json
git commit -m "feat: surface tavern intent tags in discovery"
```

---

### Task 5: Full verification and Trellis closeout

**Files:**
- Modify: `.trellis/tasks/05-06-05-06-ai-automation-inspired-tavern-types-brainstorm/prd.md`
- Modify: `.trellis/tasks/05-06-05-06-ai-automation-inspired-tavern-types-brainstorm/task.json`

- [ ] **Step 1: Run focused script tests**

```powershell
node .\frontend\scripts\tavern-intent-templates-test.mjs
node .\frontend\scripts\create-wizard-route-test.mjs
node .\frontend\scripts\gameplay-test.mjs
node .\frontend\scripts\tavern-intent-tags-test.mjs
```

Expected: each command prints its `: ok` line.

- [ ] **Step 2: Run frontend test suite**

```powershell
npm --prefix .\frontend test
```

Expected: full script chain completes with no assertion failure.

- [ ] **Step 3: Run frontend build**

```powershell
npm --prefix .\frontend run build
```

Expected: React Router build completes successfully.

- [ ] **Step 4: Run Playwright self-acceptance for visible UI changes**

Use a local frontend dev server and a small script to check `/create` at desktop and mobile viewport. Save screenshots under this task directory, for example:

```powershell
New-Item -ItemType Directory -Force ".trellis\tasks\05-06-05-06-ai-automation-inspired-tavern-types-brainstorm\artifacts" | Out-Null
npm --prefix .\frontend run dev -- --host 127.0.0.1 --port 5177
```

In another shell or automated session, run a Playwright script that opens `http://127.0.0.1:5177/create`, verifies `[data-tavern-intent-selector]`, clicks `data-tavern-intent-card="workflow-clinic"`, and saves:

```text
.trellis/tasks/05-06-05-06-ai-automation-inspired-tavern-types-brainstorm/artifacts/create-intent-desktop.png
.trellis/tasks/05-06-05-06-ai-automation-inspired-tavern-types-brainstorm/artifacts/create-intent-mobile.png
.trellis/tasks/05-06-05-06-ai-automation-inspired-tavern-types-brainstorm/artifacts/playwright-report.json
```

Expected: desktop and mobile screenshots show the intent selector without horizontal overflow, and the report records `ok: true`.

- [ ] **Step 5: Record verification evidence**

Append a `## Implementation Evidence` section to `prd.md` with exact commands and outcomes:

```markdown
## Implementation Evidence

* `node .\frontend\scripts\tavern-intent-templates-test.mjs` — passed.
* `node .\frontend\scripts\create-wizard-route-test.mjs` — passed.
* `node .\frontend\scripts\gameplay-test.mjs` — passed.
* `node .\frontend\scripts\tavern-intent-tags-test.mjs` — passed.
* `npm --prefix .\frontend test` — passed.
* `npm --prefix .\frontend run build` — passed.
* Playwright self-acceptance — passed; screenshots/report saved under `artifacts/`.
```

- [ ] **Step 6: Update task metadata**

Update `task.json` fields:

```json
{
  "status": "review",
  "current_phase": 4,
  "notes": "Implemented Approach A: owner-confirmed tavern intent template layer without schema/API changes. Verification evidence recorded in prd.md."
}
```

- [ ] **Step 7: Commit closeout notes**

```powershell
git add .trellis/tasks/05-06-05-06-ai-automation-inspired-tavern-types-brainstorm frontend
git commit -m "feat: add tavern intent template layer"
```

---

## Self-review

- Spec coverage: The plan covers the approved Approach A with catalog, create wizard, owner gameplay templates, discovery tags, tests, build, and Playwright acceptance.
- Boundary coverage: The plan explicitly avoids schema/API changes, external systems, platform-generated publishing, monetization, public social/ranking, and RPG mechanics.
- Type consistency: The catalog uses `id/title/badge/summary/primaryNpcRole/...`; create route uses `intentId` and `activeIntent`; discovery tags expose only `{ id, label, keywords, helper }`.
- Placeholder scan: No task depends on unspecified backend behavior or new schema fields.

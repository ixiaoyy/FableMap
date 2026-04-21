# Play Mode Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 收敛当前未提交的玩法模式、NPC 模板、开店向导和冒险工会体验迭代，使其具备可回归测试、清晰纯函数边界和变更记录。

**Architecture:** 前端体验逻辑保持在小型 ES module 中：`tavernPlayModes.js` 管玩法/工会，`personalityTemplates.js` 管 NPC 性格模板，新增 `tavernCreateReadiness.js` 管开店检查。React 组件只消费这些纯函数并渲染 UI，不在组件内保留可测试业务判断。

**Tech Stack:** React 18 + Vite 前端、Node ESM 脚本测试、Python pytest 后端回归。

---

## File Structure

- Modify: `frontend/src/tavernPlayModes.js` — 修正自定义委托奖励优先级，保持工会状态纯函数。
- Modify: `frontend/scripts/play-modes-test.mjs` — 扩展玩法/工会边界测试。
- Modify: `frontend/src/personalityTemplates.js` — 新增可测试的模板过滤函数。
- Modify: `frontend/src/CharacterEditor.jsx` — 使用模板过滤纯函数，减少组件内筛选逻辑。
- Create: `frontend/scripts/personality-templates-test.mjs` — 覆盖模板补空、覆盖、去重、推荐、过滤。
- Create: `frontend/src/tavernCreateReadiness.js` — 抽出开店向导准备度检查。
- Modify: `frontend/src/TavernCreatePanel.jsx` — 删除内联 `getWizardReadiness`，改为导入纯函数。
- Create: `frontend/scripts/tavern-create-readiness-test.mjs` — 覆盖准备度检查。
- Modify: `frontend/package.json` — 将新增脚本纳入 `npm test`。
- Create: `docs/changes/2026-04-21-play-mode-consolidation.md` — 记录本轮收敛、验证和风险。

---

### Task 1: Play Mode / Guild Regression

**Files:**
- Modify: `frontend/scripts/play-modes-test.mjs`
- Modify: `frontend/src/tavernPlayModes.js`

- [ ] **Step 1: Write the failing test**

Add these assertions near the existing guild progress assertions in `frontend/scripts/play-modes-test.mjs`:

```js
const bookmarkMode = inferTavernPlayMode({
  name: '普通柜台',
  bookmarks: [{ content: '模板标签：线索 / 调查 / 失物' }],
})
assert.equal(bookmarkMode.id, 'clue_game')

const customQuest = {
  id: 'errand-postcard',
  title: '高阶同名明信片',
  summary: '同 ID 自定义委托应该以传入 quest 为准。',
  objective: '确认同名自定义委托奖励。',
  difficulty: '标准',
  reward: 7,
  identityReward: '同名覆盖测试员',
  treatment: '显示自定义奖励。',
  familyFriendly: true,
}
const customCompletedProgress = updateGuildProgress(undefined, {
  type: 'complete',
  questId: customQuest.id,
  quest: customQuest,
})
assert.equal(customCompletedProgress.reputation, 7)
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node .\frontend\scripts\play-modes-test.mjs
```

Expected: FAIL on `1 !== 7`, proving `updateGuildProgress()` currently prefers the default quest over the passed custom quest when IDs collide.

- [ ] **Step 3: Write minimal implementation**

In `frontend/src/tavernPlayModes.js`, change:

```js
const quest = DEFAULT_GUILD_QUESTS.find((item) => item.id === questId) || action.quest
```

to:

```js
const quest = action.quest || DEFAULT_GUILD_QUESTS.find((item) => item.id === questId)
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
node .\frontend\scripts\play-modes-test.mjs
npm --prefix .\frontend test
```

Expected: both pass; `npm test` still reports service contract ok and play-modes-test ok.

---

### Task 2: Personality Template Pure Filtering and Tests

**Files:**
- Modify: `frontend/src/personalityTemplates.js`
- Modify: `frontend/src/CharacterEditor.jsx`
- Create: `frontend/scripts/personality-templates-test.mjs`
- Modify: `frontend/package.json`

- [ ] **Step 1: Write the failing test**

Create `frontend/scripts/personality-templates-test.mjs`:

```js
import assert from 'node:assert/strict'

import {
  NPC_PERSONALITY_TEMPLATES,
  applyNpcPersonalityTemplateToDraft,
  filterNpcPersonalityTemplates,
  recommendNpcPersonalityTemplates,
} from '../src/personalityTemplates.js'

assert.ok(NPC_PERSONALITY_TEMPLATES.length >= 7)

const warmGuide = NPC_PERSONALITY_TEMPLATES.find((template) => template.id === 'warm-guide')
assert.ok(warmGuide)

const filledDraft = applyNpcPersonalityTemplateToDraft({
  name: '门口向导',
  description: '',
  personality: '',
  scenario: '',
  system_prompt: '',
  first_mes: '',
  mes_example: '',
  alternate_greetings_text: '欢迎回来',
  tags_text: '已有标签, 温柔',
  talkativeness: null,
}, warmGuide, { mode: 'fill' })
assert.equal(filledDraft.description, warmGuide.description)
assert.equal(filledDraft.personality, warmGuide.personality)
assert.ok(filledDraft.tags_text.includes('已有标签'))
assert.equal((filledDraft.tags_text.match(/温柔/g) || []).length, 1)
assert.ok(filledDraft.alternate_greetings_text.includes('欢迎回来'))
assert.ok(filledDraft.alternate_greetings_text.includes(warmGuide.alternate_greetings[0]))
assert.equal(filledDraft.talkativeness, warmGuide.talkativeness)

const overwrittenDraft = applyNpcPersonalityTemplateToDraft({
  description: '旧描述',
  personality: '旧性格',
  scenario: '旧场景',
  system_prompt: '旧指令',
  first_mes: '旧开场',
  mes_example: '旧示例',
  alternate_greetings_text: '旧备用',
  tags_text: '旧标签',
  talkativeness: 0.99,
}, warmGuide, { mode: 'overwrite' })
assert.equal(overwrittenDraft.description, warmGuide.description)
assert.equal(overwrittenDraft.personality, warmGuide.personality)
assert.equal(overwrittenDraft.alternate_greetings_text, warmGuide.alternate_greetings.join('\n'))
assert.equal(overwrittenDraft.tags_text, warmGuide.tags.join(', '))
assert.equal(overwrittenDraft.talkativeness, warmGuide.talkativeness)

const recommended = recommendNpcPersonalityTemplates({
  name: '雨夜档案亭',
  tags_text: '失物, 档案, 线索',
}, 3)
assert.ok(recommended.some((template) => template.id === 'evidence-archivist'))

const filteredByCategory = filterNpcPersonalityTemplates({
  category: '线索推理',
  query: '档案',
  draft: {},
  limit: 4,
})
assert.ok(filteredByCategory.length > 0)
assert.ok(filteredByCategory.every((template) => template.category === '线索推理'))
assert.ok(filteredByCategory.some((template) => template.id === 'evidence-archivist'))

const filteredRecommended = filterNpcPersonalityTemplates({
  category: '推荐',
  query: '社区',
  draft: { name: '路口服务站', tags_text: '社区, 问路' },
  limit: 4,
})
assert.ok(filteredRecommended.some((template) => template.id === 'street-guardian'))

console.log('personality-templates-test: ok')
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node .\frontend\scripts\personality-templates-test.mjs
```

Expected: FAIL with missing export `filterNpcPersonalityTemplates`.

- [ ] **Step 3: Write minimal implementation**

Add to `frontend/src/personalityTemplates.js` after `recommendNpcPersonalityTemplates()`:

```js
export function filterNpcPersonalityTemplates({
  category = '推荐',
  query = '',
  draft = {},
  limit = 4,
} = {}) {
  const keyword = cleanText(query).toLowerCase()
  const source = category === '推荐'
    ? recommendNpcPersonalityTemplates(draft, limit)
    : category === '全部'
      ? NPC_PERSONALITY_TEMPLATES
      : NPC_PERSONALITY_TEMPLATES.filter((template) => template.category === category)

  if (!keyword) return source

  return source.filter((template) => [
    template.name,
    template.category,
    template.summary,
    template.bestFor,
    template.description,
    template.personality,
    template.scenario,
    template.tags?.join(' '),
    template.keywords?.join(' '),
  ].join(' ').toLowerCase().includes(keyword))
}
```

Update `frontend/src/CharacterEditor.jsx` import list to include `filterNpcPersonalityTemplates`, then replace the local `filteredPersonalityTemplates` body with:

```js
const filteredPersonalityTemplates = useMemo(() => filterNpcPersonalityTemplates({
  category: activeTemplateCategory,
  query: templateQuery,
  draft,
  limit: 4,
}), [activeTemplateCategory, draft, templateQuery])
```

Remove the now-unused `recommendedPersonalityTemplates` memo.

Update `frontend/package.json` test script to:

```json
"test": "node ./scripts/service-contract-test.mjs && node ./scripts/play-modes-test.mjs && node ./scripts/personality-templates-test.mjs"
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
node .\frontend\scripts\personality-templates-test.mjs
npm --prefix .\frontend test
npm --prefix .\frontend run build
```

Expected: script passes; npm test includes the new test; Vite build passes with only the known chunk-size warning if present.

---

### Task 3: Tavern Create Readiness Extraction

**Files:**
- Create: `frontend/src/tavernCreateReadiness.js`
- Modify: `frontend/src/TavernCreatePanel.jsx`
- Create: `frontend/scripts/tavern-create-readiness-test.mjs`
- Modify: `frontend/package.json`

- [ ] **Step 1: Write the failing test**

Create `frontend/scripts/tavern-create-readiness-test.mjs`:

```js
import assert from 'node:assert/strict'

import { getWizardReadiness } from '../src/tavernCreateReadiness.js'

const incomplete = getWizardReadiness({
  lat: '200',
  lon: 'abc',
  name: '',
  description: '',
  scene_prompt: '',
  characters: [],
}, false)
assert.equal(incomplete.total, 7)
assert.equal(incomplete.checks.find((item) => item.id === 'coordinate').done, false)
assert.equal(incomplete.checks.find((item) => item.id === 'name').done, false)
assert.deepEqual(incomplete.missingRequired.map((item) => item.id), ['coordinate', 'name'])

const readyWithoutAi = getWizardReadiness({
  lat: '31.2304',
  lon: '121.4737',
  name: '街角冒险者公会',
  description: '任务板和委托。',
  scene_prompt: '老少皆宜的轻冒险。',
  characters: [{ name: '洛塔', first_mes: '欢迎来到任务板。' }],
}, false)
assert.equal(readyWithoutAi.missingRequired.length, 0)
assert.equal(readyWithoutAi.checks.find((item) => item.id === 'ai').optional, true)
assert.equal(readyWithoutAi.checks.find((item) => item.id === 'ai').done, false)
assert.ok(readyWithoutAi.percent < 100)

const fullyReady = getWizardReadiness({
  lat: 31.2304,
  lon: 121.4737,
  name: '雨夜失物调查局',
  description: '十分钟轻推理。',
  scene_prompt: '每轮给 2-3 个选项。',
  characters: [{ name: '闻笺', firstMes: '先看钥匙还是便签？' }],
}, true)
assert.equal(fullyReady.doneCount, fullyReady.total)
assert.equal(fullyReady.percent, 100)

const resilient = getWizardReadiness({}, false)
assert.equal(resilient.checks.find((item) => item.id === 'character').done, false)
assert.equal(resilient.missingRequired.length, 2)

console.log('tavern-create-readiness-test: ok')
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node .\frontend\scripts\tavern-create-readiness-test.mjs
```

Expected: FAIL with module not found for `tavernCreateReadiness.js`.

- [ ] **Step 3: Write minimal implementation**

Create `frontend/src/tavernCreateReadiness.js`:

```js
function text(value) {
  return String(value || '').trim()
}

export function getWizardReadiness(form = {}, hasLlmConfig = false) {
  const characters = Array.isArray(form.characters) ? form.characters : []
  const lat = Number.parseFloat(form.lat)
  const lon = Number.parseFloat(form.lon)
  const firstCharacter = characters[0] || {}
  const checks = [
    {
      id: 'coordinate',
      label: '地图坐标有效',
      hint: '酒馆能被挂到真实地图上',
      done: Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lon) && lon >= -180 && lon <= 180,
      step: 1,
      required: true,
    },
    {
      id: 'name',
      label: '酒馆有清楚名称',
      hint: '访客在地图上能一眼认出入口',
      done: Boolean(text(form.name)),
      step: 2,
      required: true,
    },
    {
      id: 'description',
      label: '入口简介已填写',
      hint: '降低访客进入前的不确定感',
      done: Boolean(text(form.description)),
      step: 2,
    },
    {
      id: 'scene',
      label: '场景氛围已填写',
      hint: '让 NPC 回答更稳定、更有空间感',
      done: Boolean(text(form.scene_prompt)),
      step: 2,
    },
    {
      id: 'character',
      label: '至少有 1 个 NPC',
      hint: '进入后有明确对话对象',
      done: characters.length > 0,
      step: 3,
    },
    {
      id: 'first_mes',
      label: 'NPC 有开场白',
      hint: '访客第一句不用自己硬想',
      done: Boolean(text(firstCharacter.first_mes || firstCharacter.firstMes)),
      step: 3,
    },
    {
      id: 'ai',
      label: 'AI 配置可用',
      hint: '也可以先跳过，创建后再配置',
      done: Boolean(hasLlmConfig),
      step: 4,
      optional: true,
    },
  ]
  const doneCount = checks.filter((item) => item.done).length
  return {
    checks,
    doneCount,
    total: checks.length,
    percent: Math.round((doneCount / checks.length) * 100),
    missingRequired: checks.filter((item) => item.required && !item.done),
  }
}
```

Update `frontend/src/TavernCreatePanel.jsx`:

```js
import { getWizardReadiness } from './tavernCreateReadiness'
```

Then delete the inline `getWizardReadiness()` function from the component file.

Update `frontend/package.json` test script to:

```json
"test": "node ./scripts/service-contract-test.mjs && node ./scripts/play-modes-test.mjs && node ./scripts/personality-templates-test.mjs && node ./scripts/tavern-create-readiness-test.mjs"
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
node .\frontend\scripts\tavern-create-readiness-test.mjs
npm --prefix .\frontend test
npm --prefix .\frontend run build
```

Expected: readiness script passes; full frontend test script passes; build passes with only known chunk warning if present.

---

### Task 4: Change Record and Full Verification

**Files:**
- Create: `docs/changes/2026-04-21-play-mode-consolidation.md`

- [ ] **Step 1: Write change record**

Create `docs/changes/2026-04-21-play-mode-consolidation.md`:

```md
# 2026-04-21 Play Mode Consolidation

## Summary

收敛当前前端体验迭代：玩法模式识别、快捷开始、冒险工会任务板、NPC 性格模板和开店向导准备度检查。

## Changes

- 扩展 `tavernPlayModes` 回归测试，覆盖书签玩法识别和自定义同 ID 委托奖励。
- 修正冒险工会完成委托时实际传入 quest 的奖励优先级。
- 为 NPC 性格模板新增过滤纯函数和脚本测试。
- 将开店向导准备度检查抽为 `tavernCreateReadiness.js` 并补脚本测试。
- 将新增前端脚本纳入 `npm --prefix .\frontend test`。

## Verification

- `py -3 -m compileall -q fablemap`
- `py -3 -m pytest -q --tb=short`
- `npm --prefix .\frontend test`
- `npm --prefix .\frontend run build`

## Known Risks

- 冒险工会进度仍是 localStorage 本地状态，跨设备不同步。
- Vite production build 仍可能提示主 chunk 超过 500 kB，本轮未做代码拆分。
- 本轮测试是脚本级单元/合约测试，不包含浏览器端点击流程 E2E。
```

- [ ] **Step 2: Run full verification**

Run:

```powershell
py -3 -m compileall -q fablemap
py -3 -m pytest -q --tb=short
npm --prefix .\frontend test
npm --prefix .\frontend run build
```

Expected:

- Python compileall exit code 0.
- Pytest reports all tests passed.
- Frontend test reports service contract, play modes, personality templates, and readiness tests ok.
- Frontend build exits 0; known chunk-size warning may remain.

---

## Round Limit

Implementation may use up to 5 rounds:

1. Round 1: Task 1 red/green + frontend test.
2. Round 2: Task 2 red/green + frontend test/build.
3. Round 3: Task 3 red/green + frontend test/build.
4. Round 4: Task 4 full verification and docs.
5. Round 5: Reserved for systematic debugging if any verification fails.

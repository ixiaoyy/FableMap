# Chat Gameplay Conversation Beats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make ordinary FableMap tavern chat feel less monotonous by adding optional conversation-intent chips and per-reply progress cards to the active SillyTavern-style chat workbench.

**Architecture:** Implement a frontend-first layer on top of the existing `/tavern/:id` workbench. Default chip definitions and progress-signal extraction live in a pure helper module; the React workbench owns selected-intent state and attaches progress metadata to local chat messages. Backend schema stays unchanged because single-NPC chat already accepts `extra_context` / `display_message`, and group chat already supports `display_message`.

**Tech Stack:** React Router Framework, React 18, TypeScript/TSX, plain ESM helper module, existing `frontend/app/lib/taverns.ts` API client, Node script regression tests, Vite/React Router build, Playwright self-acceptance.

---

## Scope and File Map

Primary implementation target: `D:\work\ai-\frontend\app\features\tavern-chat-workbench\index.tsx`.

Do not start in `D:\work\ai-\frontend\app\product\TavernChatRoom.jsx`; that legacy product-parity surface is not the active native route target for this first slice.

Files:

- Create: `D:\work\ai-\frontend\app\features\tavern-chat-workbench\conversation-beats.js`
- Create: `D:\work\ai-\frontend\scripts\conversation-beats-test.mjs`
- Modify: `D:\work\ai-\frontend\app\lib\taverns.ts`
- Modify: `D:\work\ai-\frontend\app\features\tavern-chat-workbench\index.tsx`
- Modify: `D:\work\ai-\frontend\scripts\tavern-chat-workbench-test.mjs`
- Modify: `D:\work\ai-\frontend\package.json`
- Update after implementation: `D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\prd.md`

Data flow:

```text
Visitor clicks chip
  -> React stores selectedIntentId locally
  -> visitor types message
  -> visible local user line uses only visitor text
  -> single chat sends extra_context + display_message=visitor text
  -> group chat sends augmented prompt + display_message=visitor text
  -> backend stores display_message as user-visible content
  -> response fields become local progress_signals
  -> UI renders progress card under that assistant reply
```

Boundaries:

- Chip selection does not auto-send.
- Chip text does not replace visitor text.
- No new persisted conversation-beat schema.
- No owner editor in this MVP.
- No combat, levels, equipment, rankings, paid economy, or platform-published canon.

---

### Task 1: Add pure conversation-beats helper and regression test

**Files:**

- Create: `D:\work\ai-\frontend\app\features\tavern-chat-workbench\conversation-beats.js`
- Create: `D:\work\ai-\frontend\scripts\conversation-beats-test.mjs`
- Modify: `D:\work\ai-\frontend\package.json`

- [ ] **Step 1: Create helper module**

Create `D:\work\ai-\frontend\app\features\tavern-chat-workbench\conversation-beats.js`:

```javascript
export const CONVERSATION_INTENT_CHIPS = [
  {
    id: "follow_clue",
    label: "追问线索",
    hint: "把刚才提到的人、地点或异常问清楚",
    context: "访客想追问刚才出现的线索。请围绕已有空间/NPC设定回应，不要凭空新增未确认正史。",
  },
  {
    id: "comfort",
    label: "安慰一下",
    hint: "用温和方式接住 NPC 的情绪",
    context: "访客想用安慰、理解或陪伴的方式回应。请让 NPC 接住这份善意。",
  },
  {
    id: "test_attitude",
    label: "试探态度",
    hint: "观察 NPC 对某件事的真实反应",
    context: "访客想试探 NPC 的态度。请体现角色性格，但不要替访客做决定。",
  },
  {
    id: "ask_advice",
    label: "请 NPC 建议",
    hint: "让 NPC 给出下一步可聊的方向",
    context: "访客想请 NPC 给建议。请给出空间内可继续对话或探索的轻量方向。",
  },
  {
    id: "light_topic",
    label: "换个轻松话题",
    hint: "把对话转向轻松、日常、可继续聊的内容",
    context: "访客想把话题转轻松。请保持角色口吻，给出自然的日常接话。",
  },
]

export function findConversationIntent(intentId) {
  const id = String(intentId || "").trim()
  return CONVERSATION_INTENT_CHIPS.find((chip) => chip.id === id) || null
}

export function buildConversationIntentContext(intent) {
  if (!intent) return []
  return [
    {
      role: "system",
      content: `本轮访客选择了对话意图「${intent.label}」。${intent.context} 这个意图只用于理解语气和互动方向，不代表访客说出了额外事实。`,
    },
  ]
}

export function buildMessageWithConversationIntent(message, intent) {
  const text = String(message || "").trim()
  if (!intent) return text
  return `【对话意图：${intent.label}】\n${intent.context}\n\n访客原文：${text}`
}

function countList(value) {
  return Array.isArray(value) ? value.length : 0
}

function affinityStageLabel(affinity) {
  if (!affinity || typeof affinity !== "object") return ""
  return String(affinity.stage_label_zh || affinity.new_stage || "").trim()
}

export function progressSignalsFromChatResult(result) {
  const signals = []
  const memoryCount = countList(result?.created_memories)
  const stateCardCount = countList(result?.state_card_candidates)
  const affinity = result?.affinity && typeof result.affinity === "object" ? result.affinity : null
  const stageLabel = affinityStageLabel(affinity)

  if (memoryCount > 0) {
    signals.push({
      id: "memory",
      label: `记住了 ${memoryCount} 件事`,
      detail: "这轮对话留下了可用于回访的线索。",
      tone: "memory",
    })
  }

  if (affinity?.stage_changed) {
    signals.push({
      id: "affinity-stage",
      label: stageLabel ? `关系进入「${stageLabel}」` : "关系阶段有变化",
      detail: "NPC 对你的熟悉感出现了新的阶段。",
      tone: "affinity",
    })
  } else if (affinity && Number.isFinite(Number(affinity.strength))) {
    signals.push({
      id: "affinity",
      label: stageLabel ? `当前关系：${stageLabel}` : "关系略有变化",
      detail: "这轮互动已计入当前空间的关系进度。",
      tone: "affinity",
    })
  }

  if (stateCardCount > 0) {
    signals.push({
      id: "state-card",
      label: `可整理 ${stateCardCount} 条连续性线索`,
      detail: "这轮内容可沉淀为后续对话的状态线索。",
      tone: "state-card",
    })
  }

  return signals
}
```

- [ ] **Step 2: Create focused helper test**

Create `D:\work\ai-\frontend\scripts\conversation-beats-test.mjs`:

```javascript
import assert from "node:assert/strict"

import {
  CONVERSATION_INTENT_CHIPS,
  buildConversationIntentContext,
  buildMessageWithConversationIntent,
  findConversationIntent,
  progressSignalsFromChatResult,
} from "../app/features/tavern-chat-workbench/conversation-beats.js"

assert.deepEqual(
  CONVERSATION_INTENT_CHIPS.map((chip) => chip.label),
  ["追问线索", "安慰一下", "试探态度", "请 NPC 建议", "换个轻松话题"],
  "default conversation intent chips should match the MVP labels",
)

const clueIntent = findConversationIntent("follow_clue")
assert.equal(clueIntent.label, "追问线索", "findConversationIntent should return the selected chip")
assert.equal(findConversationIntent("missing"), null, "unknown chip id should return null")

const context = buildConversationIntentContext(clueIntent)
assert.equal(context.length, 1, "selected intent should produce one hidden context item")
assert.equal(context[0].role, "system", "intent context should be system-scoped guidance")
assert.ok(context[0].content.includes("追问线索"), "intent context should include the selected label")
assert.ok(context[0].content.includes("不代表访客说出了额外事实"), "intent context should preserve visitor agency")
assert.deepEqual(buildConversationIntentContext(null), [], "missing intent should not add context")

const visibleMessage = "你刚才说的纸条在哪里？"
assert.equal(
  buildMessageWithConversationIntent(visibleMessage, null),
  visibleMessage,
  "message without intent should remain unchanged",
)
const augmentedMessage = buildMessageWithConversationIntent(visibleMessage, clueIntent)
assert.ok(augmentedMessage.includes("【对话意图：追问线索】"), "group chat augmented prompt should include hidden intent")
assert.ok(augmentedMessage.includes(`访客原文：${visibleMessage}`), "group chat augmented prompt should preserve the original text")

const signals = progressSignalsFromChatResult({
  created_memories: [{ id: "mem_1" }],
  state_card_candidates: [{ id: "card_1" }, { id: "card_2" }],
  affinity: {
    strength: 0.21,
    previous_stage: "stranger",
    new_stage: "familiar",
    stage_label_zh: "熟人",
    stage_changed: true,
  },
})
assert.deepEqual(
  signals.map((signal) => signal.id),
  ["memory", "affinity-stage", "state-card"],
  "progress signals should summarize existing backend response data in stable order",
)
assert.ok(signals[0].label.includes("记住了 1 件事"), "memory signal should show count")
assert.ok(signals[1].label.includes("熟人"), "affinity stage signal should show the stage label")
assert.ok(signals[2].label.includes("2 条"), "state-card signal should show count")
assert.deepEqual(progressSignalsFromChatResult({}), [], "empty response data should not render progress signals")

console.log("conversation-beats-test: ok")
```

- [ ] **Step 3: Run focused helper test**

Run:

```powershell
node .\frontend\scripts\conversation-beats-test.mjs
```

Expected output:

```text
conversation-beats-test: ok
```

- [ ] **Step 4: Wire helper test into package script**

Modify `D:\work\ai-\frontend\package.json` so `"test"` begins with:

```json
"node ./scripts/conversation-beats-test.mjs && node ./scripts/service-contract-test.mjs"
```

Keep the rest of the existing test chain unchanged.

---

### Task 2: Type existing chat request/context metadata

**Files:**

- Modify: `D:\work\ai-\frontend\app\lib\taverns.ts`

- [ ] **Step 1: Add local progress-signal type and extend `ChatMessage`**

In `D:\work\ai-\frontend\app\lib\taverns.ts`, update the chat message section to:

```typescript
export type ConversationProgressSignal = {
  id: string
  label: string
  detail?: string
  tone?: string
}

export type ChatMessage = {
  id?: string
  role: "user" | "assistant" | string
  content: string
  character_id?: string
  visitor_id?: string
  visitor_name?: string
  visitor_gender?: Gender | string
  timestamp?: string
  progress_signals?: ConversationProgressSignal[]
}
```

- [ ] **Step 2: Type the already-supported single chat request fields**

In `sendTavernChat`, change the `data` parameter type to include:

```typescript
extra_context?: Array<Record<string, unknown>>
display_message?: string
```

The final `data` shape should be:

```typescript
data: {
  character_id: string
  message: string
  visitor_id: string
  visitor_name?: string
  visitor_gender?: Gender | string
  extra_context?: Array<Record<string, unknown>>
  display_message?: string
},
```

Do not change the runtime function body; backend `ChatRequest` already accepts these fields.

- [ ] **Step 3: Verify typecheck**

Run:

```powershell
npm --prefix .\frontend run typecheck
```

Expected: exits 0.

---

### Task 3: Render selected-intent chips in the native composer

**Files:**

- Modify: `D:\work\ai-\frontend\app\features\tavern-chat-workbench\index.tsx`
- Modify: `D:\work\ai-\frontend\scripts\tavern-chat-workbench-test.mjs`

- [ ] **Step 1: Import helper functions**

Add near existing imports in `index.tsx`:

```typescript
import {
  CONVERSATION_INTENT_CHIPS,
  buildConversationIntentContext,
  buildMessageWithConversationIntent,
  findConversationIntent,
  progressSignalsFromChatResult,
} from "./conversation-beats.js"
```

- [ ] **Step 2: Add selected-intent state**

After `const [message, setMessage] = useState("")`, add:

```typescript
const [selectedIntentId, setSelectedIntentId] = useState("")
const selectedIntent = useMemo(() => findConversationIntent(selectedIntentId), [selectedIntentId])
```

- [ ] **Step 3: Add chip interaction helpers**

Before `handleSubmit`, add:

```typescript
function toggleConversationIntent(intentId: string) {
  setSelectedIntentId((current) => (current === intentId ? "" : intentId))
  setError("")
}

function clearConversationIntent() {
  setSelectedIntentId("")
}
```

- [ ] **Step 4: Insert chip row above the textarea**

Inside the composer form, after the visitor identity `<details>` and before the textarea row, insert:

```tsx
<div data-conversation-intent-chips aria-label="对话意图" className="mb-3 rounded-2xl border border-white/10 bg-white/[0.035] p-2.5">
  <div className="flex flex-wrap items-center gap-2">
    <span className="px-1 text-xs font-black uppercase tracking-[0.16em] text-violet-100/45">本轮想怎么聊</span>
    {CONVERSATION_INTENT_CHIPS.map((intent) => {
      const active = selectedIntentId === intent.id
      return (
        <button
          key={intent.id}
          type="button"
          aria-pressed={active}
          title={intent.hint}
          onClick={() => toggleConversationIntent(intent.id)}
          className={`min-h-9 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
            active
              ? "border-cyan-200/65 bg-cyan-300/18 text-cyan-50 shadow-lg shadow-cyan-950/20"
              : "border-white/10 bg-slate-950/35 text-violet-50/68 hover:border-cyan-300/35 hover:bg-cyan-300/8"
          }`}
        >
          {intent.label}
        </button>
      )
    })}
  </div>
  {selectedIntent ? (
    <div data-selected-conversation-intent className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-cyan-300/18 bg-cyan-300/8 px-3 py-2 text-xs leading-5 text-cyan-50/78">
      <span>已选择：<strong className="text-white">{selectedIntent.label}</strong> · 仍需输入你自己的话再发送</span>
      <button type="button" onClick={clearConversationIntent} className="font-black text-cyan-100 underline-offset-4 hover:underline">
        清除
      </button>
    </div>
  ) : null}
</div>
```

- [ ] **Step 5: Add source assertions**

In `D:\work\ai-\frontend\scripts\tavern-chat-workbench-test.mjs`, add a source read:

```javascript
const beatsSource = readFileSync(resolve(__dirname, "../app/features/tavern-chat-workbench/conversation-beats.js"), "utf8")
```

Then add:

```javascript
for (const label of ["追问线索", "安慰一下", "试探态度", "请 NPC 建议", "换个轻松话题"]) {
  assert.ok(beatsSource.includes(label), `conversation beats helper should define chip label: ${label}`)
}

for (const snippet of [
  "data-conversation-intent-chips",
  "aria-label=\"对话意图\"",
  "CONVERSATION_INTENT_CHIPS.map",
  "aria-pressed={active}",
  "data-selected-conversation-intent",
  "已选择：",
  "仍需输入你自己的话再发送",
  "clearConversationIntent",
]) {
  assert.ok(workbenchSource.includes(snippet), `conversation beat chip UI should include ${snippet}`)
}
```

- [ ] **Step 6: Run focused tests**

Run:

```powershell
node .\frontend\scripts\conversation-beats-test.mjs
node .\frontend\scripts\tavern-chat-workbench-test.mjs
```

Expected: both print `ok`.

---

### Task 4: Thread intent into send flow without changing visible history

**Files:**

- Modify: `D:\work\ai-\frontend\app\features\tavern-chat-workbench\index.tsx`
- Modify: `D:\work\ai-\frontend\scripts\tavern-chat-workbench-test.mjs`

- [ ] **Step 1: Preserve intent for the turn and clear after submit**

In `handleSubmit`, after `const cleanMessage = message.trim()`, add:

```typescript
const intentForTurn = selectedIntent
```

After `setMessage("")`, add:

```typescript
setSelectedIntentId("")
```

Change:

```typescript
await sendPublicChat(cleanMessage)
await sendPrivateChat(cleanMessage)
```

to:

```typescript
await sendPublicChat(cleanMessage, intentForTurn)
await sendPrivateChat(cleanMessage, intentForTurn)
```

- [ ] **Step 2: Update send helper signatures**

Change signatures to:

```typescript
async function sendPrivateChat(cleanMessage: string, intentForTurn: ReturnType<typeof findConversationIntent>) {
```

```typescript
async function sendPublicChat(cleanMessage: string, intentForTurn: ReturnType<typeof findConversationIntent>) {
```

- [ ] **Step 3: Add hidden context and visible display message to all `sendTavernChat` calls**

Every `sendTavernChat` payload should include:

```typescript
extra_context: buildConversationIntentContext(intentForTurn),
display_message: cleanMessage,
```

Private branch example:

```typescript
const result = await sendTavernChat(tavern.id, {
  character_id: selectedCharacter.id,
  visitor_id: visitorId,
  visitor_name: visitorName,
  visitor_gender: visitorGender,
  message: cleanMessage,
  extra_context: buildConversationIntentContext(intentForTurn),
  display_message: cleanMessage,
})
```

Mention branch keeps `message: mention.message` and still uses `display_message: cleanMessage`.

- [ ] **Step 4: Preserve visible group chat text while sending intent to the model**

Change the `sendGroupChat` payload to:

```typescript
const result = await sendGroupChat(tavern.id, {
  message: buildMessageWithConversationIntent(cleanMessage, intentForTurn),
  display_message: cleanMessage,
  visitor_id: visitorId,
  visitor_name: visitorName,
  visitor_gender: visitorGender,
})
```

- [ ] **Step 5: Add source assertions for send flow**

Add to `tavern-chat-workbench-test.mjs`:

```javascript
for (const snippet of [
  "const intentForTurn = selectedIntent",
  "setSelectedIntentId(\"\")",
  "extra_context: buildConversationIntentContext(intentForTurn)",
  "display_message: cleanMessage",
  "message: buildMessageWithConversationIntent(cleanMessage, intentForTurn)",
]) {
  assert.ok(workbenchSource.includes(snippet), `conversation intent send flow should include ${snippet}`)
}
```

- [ ] **Step 6: Run focused tests and typecheck**

Run:

```powershell
node .\frontend\scripts\conversation-beats-test.mjs
node .\frontend\scripts\tavern-chat-workbench-test.mjs
npm --prefix .\frontend run typecheck
```

Expected: both scripts print `ok`; typecheck exits 0.

---

### Task 5: Attach and render per-reply progress cards

**Files:**

- Modify: `D:\work\ai-\frontend\app\features\tavern-chat-workbench\index.tsx`
- Modify: `D:\work\ai-\frontend\scripts\tavern-chat-workbench-test.mjs`

- [ ] **Step 1: Let assistant lines carry progress signals**

Change `buildAssistantLine` signature to:

```typescript
function buildAssistantLine(content: string, characterId?: string, result?: unknown): ChatMessage {
```

Return:

```typescript
return {
  id: `local-assistant-${now}`,
  role: "assistant",
  content,
  character_id: characterId,
  visitor_id: visitorId,
  timestamp: now,
  progress_signals: progressSignalsFromChatResult(result),
}
```

- [ ] **Step 2: Pass `result` to assistant-line builders**

Change successful single chat reply builders to:

```typescript
buildAssistantLine(responseText, selectedCharacter.id, result)
buildAssistantLine(responseText, mention.character.id, result)
buildAssistantLine(responseText, targetCharacter.id, result)
```

- [ ] **Step 3: Attach group progress to final group reply**

Replace `mapGroupResponseMessages` with:

```typescript
function mapGroupResponseMessages(result: Awaited<ReturnType<typeof sendGroupChat>>): ChatMessage[] {
  const progressSignals = progressSignalsFromChatResult(result)
  const messages = (Array.isArray(result.messages) ? result.messages : [])
    .map((groupMessage, index) => ({
      id: groupMessage.id || `local-group-${Date.now()}-${index}`,
      role: groupMessage.role || "assistant",
      content: String(groupMessage.content || "").trim(),
      character_id: groupMessage.character_id,
      visitor_name: groupMessage.visitor_name,
      timestamp: groupMessage.timestamp || new Date().toISOString(),
    }))
    .filter((groupMessage) => groupMessage.content)

  if (!messages.length || !progressSignals.length) return messages
  return messages.map((groupMessage, index) => (
    index === messages.length - 1 ? { ...groupMessage, progress_signals: progressSignals } : groupMessage
  ))
}
```

- [ ] **Step 4: Render progress card under assistant bubble**

In the visible message map, wrap the existing bubble in a column and render:

```tsx
{!isUser && Array.isArray(line.progress_signals) && line.progress_signals.length ? (
  <div data-conversation-progress-card className="w-full rounded-2xl border border-cyan-300/18 bg-cyan-300/8 p-3 text-xs leading-5 text-cyan-50/78">
    <p className="font-black uppercase tracking-[0.16em] text-cyan-100/62">本轮有推进</p>
    <div className="mt-2 flex flex-wrap gap-2">
      {line.progress_signals.map((signal) => (
        <span key={signal.id} className="rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 font-bold text-cyan-50">
          {signal.label}
        </span>
      ))}
    </div>
    {line.progress_signals[0]?.detail ? <p className="mt-2 text-cyan-50/64">{line.progress_signals[0].detail}</p> : null}
  </div>
) : null}
```

Keep the progress card inside the same outer message row, directly below the assistant reply bubble.

- [ ] **Step 5: Add source assertions for progress cards**

Add to `tavern-chat-workbench-test.mjs`:

```javascript
for (const snippet of [
  "progress_signals: progressSignalsFromChatResult(result)",
  "const progressSignals = progressSignalsFromChatResult(result)",
  "data-conversation-progress-card",
  "本轮有推进",
  "line.progress_signals.map",
]) {
  assert.ok(workbenchSource.includes(snippet), `conversation progress card should include ${snippet}`)
}
```

- [ ] **Step 6: Run focused tests and typecheck**

Run:

```powershell
node .\frontend\scripts\conversation-beats-test.mjs
node .\frontend\scripts\tavern-chat-workbench-test.mjs
npm --prefix .\frontend run typecheck
```

Expected: both scripts print `ok`; typecheck exits 0.

---

### Task 6: Full verification and browser self-acceptance

**Files:**

- Create if needed: `D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\artifacts\playwright-conversation-beats-check.mjs`
- Create by running browser check:
  - `D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\artifacts\conversation-beats-desktop.png`
  - `D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\artifacts\conversation-beats-mobile.png`
  - `D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\artifacts\conversation-beats-playwright-report.json`
- Update: `D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\prd.md`

- [ ] **Step 1: Run focused and full frontend tests**

Run:

```powershell
node .\frontend\scripts\conversation-beats-test.mjs
node .\frontend\scripts\tavern-chat-workbench-test.mjs
npm --prefix .\frontend test
```

Expected: focused scripts print `ok`; full frontend suite exits 0.

- [ ] **Step 2: Run typecheck and build**

Run:

```powershell
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
```

Expected: both commands exit 0.

- [ ] **Step 3: Run Playwright desktop/mobile self-acceptance**

Use a local dev server:

```powershell
npm --prefix .\frontend run dev -- --host 127.0.0.1 --port 5187
```

Then run a Playwright script that checks:

- `data-chat-workbench="sillytavern-style"` exists.
- `data-conversation-intent-chips` exists.
- clicking `追问线索` shows `data-selected-conversation-intent`.
- desktop viewport 1440x1000 has no console errors or horizontal overflow.
- mobile viewport 390x844 has no console errors or horizontal overflow.
- screenshots are written to the task artifacts directory.

Expected artifacts:

```text
D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\artifacts\conversation-beats-desktop.png
D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\artifacts\conversation-beats-mobile.png
D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\artifacts\conversation-beats-playwright-report.json
```

- [ ] **Step 4: Record implementation notes and verification in PRD**

Append to `D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\prd.md`:

```markdown
## Implementation Notes

* Added default conversation intent chips to the active native tavern chat workbench.
* Chip selection only marks intent; visitors still type and send their own message.
* Single-NPC chat sends selected intent via existing `extra_context` and keeps `display_message` equal to visible visitor text.
* Group chat sends an augmented prompt message while preserving `display_message` as visible visitor text.
* Progress cards render under assistant replies from existing `created_memories`, `affinity`, and `state_card_candidates` response fields.

## Verification

* `node .\frontend\scripts\conversation-beats-test.mjs` — replace with result.
* `node .\frontend\scripts\tavern-chat-workbench-test.mjs` — replace with result.
* `npm --prefix .\frontend test` — replace with result.
* `npm --prefix .\frontend run typecheck` — replace with result.
* `npm --prefix .\frontend run build` — replace with result.
* Playwright desktop/mobile self-acceptance — replace with screenshot/report paths.
```

---

## Plan Self-Review

**Spec coverage:**

- Default chips: Task 1 and Task 3.
- Click selects intent, no auto-send: Task 3 and Task 4.
- Visitor-visible message stays user-authored: Task 4 uses `display_message: cleanMessage` and local user lines use `cleanMessage`.
- Hidden/structured context: Task 4 uses `extra_context` for `sendTavernChat` and augmented non-visible group prompt with `display_message` for group chat.
- Progress card under assistant reply: Task 5.
- Mobile usability and verification: Task 6.
- No new owner schema/economy/RPG systems: no task adds backend schema, owner editor, economy, combat, levels, equipment, or rankings.

**Placeholder scan:** No `TODO`, `TBD`, or unspecified implementation step remains in this plan.

**Type consistency:** `ConversationProgressSignal`, `progress_signals`, `extra_context`, and `display_message` are consistently named across helper, API client type, TSX state, and tests.

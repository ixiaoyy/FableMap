import {
  Bot,
  ChevronDown,
  DoorOpen,
  Heart,
  History,
  LockKeyhole,
  MapPin,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  UsersRound,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react"

import { formatRelationshipStage } from "../../lib/owner-summary.js"
import { formatRevisitTime } from "../../lib/revisit-summary.js"
import { GENDER_OPTIONS, genderLabel, normalizeGender } from "../../lib/gender.js"
import {
  enterTavern,
  errorMessage,
  getTavernChatHistory,
  sendTavernChat,
  type ChatMessage,
  type RoleplayState,
  type Tavern,
  type TavernCharacter,
  type VisitorStatePayload,
} from "../../lib/taverns"
import { Button } from "../../ui/button"

type TavernChatWorkbenchProps = {
  tavern: Tavern
  roleplay?: RoleplayState | null
  currentUserId: string
  isOwner: boolean
  publicPanel?: ReactNode
  ownerPanel?: ReactNode
}

type DetailSectionProps = {
  title: string
  description?: string
  defaultOpen?: boolean
  children: ReactNode
}

const CHAT_HISTORY_LIMIT = 80

function DetailSection({ title, description, defaultOpen = false, children }: DetailSectionProps) {
  return (
    <details className="group rounded-3xl border border-white/10 bg-white/[0.04] p-4" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left">
        <span>
          <span className="block text-sm font-black text-white">{title}</span>
          {description ? <span className="mt-1 block text-xs leading-5 text-violet-100/58">{description}</span> : null}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-cyan-100 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-4 space-y-3">{children}</div>
    </details>
  )
}

function textOrFallback(value: unknown, fallback = "未填写") {
  const text = String(value ?? "").trim()
  return text || fallback
}

function avatarSource(character: TavernCharacter | undefined) {
  if (!character) return ""
  if (character.avatar) return normalizeNpcAssetPath(character.avatar)
  if (character.image_url) return normalizeNpcAssetPath(character.image_url)
  const sprites = character.sprites || {}
  return normalizeNpcAssetPath(sprites.neutral || sprites.default || Object.values(sprites)[0] || "")
}

function normalizeNpcAssetPath(src: string) {
  const value = String(src || "").trim()
  const match = value.match(/^\/assets\/npcs\/(char_pw_.+)-(neutral|joy|happy|anger|angry|curiosity|curious|embarrassment|shy)\.png$/)
  if (!match) return value
  const expressionAliases: Record<string, string> = {
    happy: "joy",
    angry: "anger",
    curious: "curiosity",
    shy: "embarrassment",
  }
  const expression = expressionAliases[match[2]] || match[2]
  return `/assets/npcs/public-welfare/${match[1]}/${expression}.png`
}

function canRenderImage(src: string) {
  return /^(https?:)?\/\//.test(src) || src.startsWith("/") || src.startsWith("data:")
}

function characterGreeting(character: TavernCharacter | undefined, tavernName: string): ChatMessage[] {
  if (!character) return []
  const content = String(character.first_mes || "").trim() || `欢迎来到${tavernName}，我是 ${character.name || "这里的 NPC"}。想聊什么都可以直接输入。`
  return [
    {
      role: "assistant",
      character_id: character.id,
      content,
    },
  ]
}

function formatChatTime(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
}

function formatCoordinate(value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—"
  return value.toFixed(5)
}

function relationshipSummary(state: VisitorStatePayload | null) {
  if (!state) return "本次会话尚未写入回访状态。"
  const relationship = state.relationship || {}
  const strength = Number(relationship.strength ?? 0)
  const stage = formatRelationshipStage(String(relationship.stage || ""), strength)
  const visitCount = Number(state.visit_count ?? 0)
  const lastVisit = formatRevisitTime(state.last_visit)
  return `${stage} · ${visitCount || 0} 次到访${lastVisit && lastVisit !== "暂无记录" ? ` · 最近 ${lastVisit}` : ""}`
}

function accessLabel(access?: string) {
  const value = String(access || "public")
  if (value === "private") return "私密"
  if (value === "password") return "密码"
  return "公开"
}

function roleplayModeLabel(mode?: string) {
  return mode === "hybrid" ? "AI + 玩家扮演" : "AI NPC"
}

function WorkbenchChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 text-xs font-semibold text-violet-50/72">
      {children}
    </span>
  )
}

function CharacterAvatar({ character, active }: { character?: TavernCharacter; active?: boolean }) {
  const src = avatarSource(character)
  if (src && canRenderImage(src)) {
    return (
      <img
        src={src}
        alt={character?.name || "NPC avatar"}
        className={`h-12 w-12 rounded-2xl object-cover ring-1 ${active ? "ring-cyan-200/60" : "ring-white/12"}`}
      />
    )
  }

  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-black ring-1 ${
        active ? "bg-cyan-300/18 text-cyan-50 ring-cyan-200/60" : "bg-white/[0.06] text-violet-50 ring-white/12"
      }`}
    >
      {src || (character?.name || "?").slice(0, 1)}
    </span>
  )
}

function VisitorMemoryPanel({
  visitorId,
  visitorName,
  visitorGender,
  visitorState,
  historyError,
}: {
  visitorId: string
  visitorName: string
  visitorGender: string
  visitorState: VisitorStatePayload | null
  historyError: string
}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="grid gap-2 sm:grid-cols-2">
        <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-3 text-violet-50/72">
          <span className="block text-xs uppercase tracking-[0.16em] text-violet-100/45">Visitor</span>
          <span className="mt-1 block break-all font-bold text-white">{visitorName || visitorId}</span>
        </p>
        <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-3 text-violet-50/72">
          <span className="block text-xs uppercase tracking-[0.16em] text-violet-100/45">Gender</span>
          <span className="mt-1 block font-bold text-white">{genderLabel(visitorState?.gender || visitorGender)}</span>
        </p>
      </div>
      <p className="rounded-2xl border border-cyan-300/18 bg-cyan-300/8 p-3 leading-6 text-cyan-50">
        <Heart className="mr-2 inline h-4 w-4" />
        {relationshipSummary(visitorState)}
      </p>
      {historyError ? (
        <p className="rounded-2xl border border-amber-300/22 bg-amber-300/10 p-3 leading-6 text-amber-50">{historyError}</p>
      ) : null}
    </div>
  )
}

export function TavernChatWorkbench({
  tavern,
  roleplay,
  currentUserId,
  isOwner,
  publicPanel,
  ownerPanel,
}: TavernChatWorkbenchProps) {
  const characters = useMemo(() => (Array.isArray(tavern.characters) ? tavern.characters : []), [tavern.characters])
  const [selectedCharacterId, setSelectedCharacterId] = useState(characters[0]?.id || "")
  const selectedCharacter = useMemo(
    () => characters.find((character) => character.id === selectedCharacterId) || characters[0],
    [characters, selectedCharacterId],
  )
  const [visitorId] = useState(currentUserId)
  const [visitorName, setVisitorName] = useState(isOwner ? "店主" : "旅人")
  const [visitorGender, setVisitorGender] = useState("unspecified")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [visitorState, setVisitorState] = useState<VisitorStatePayload | null>(null)
  const [password, setPassword] = useState("")
  const [hasEnteredPasswordTavern, setHasEnteredPasswordTavern] = useState(false)
  const [busy, setBusy] = useState("")
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [historyError, setHistoryError] = useState("")
  const chatLogRef = useRef<HTMLDivElement | null>(null)

  const access = String(tavern.access || "public")
  const passwordLocked = access === "password" && !isOwner && !hasEnteredPasswordTavern
  const visibleMessages = messages.length ? messages : characterGreeting(selectedCharacter, tavern.name)
  const roleplayMode = roleplay?.roleplay_mode || tavern.roleplay_mode || "ai_only"
  const approvedClaims = roleplay?.claims?.filter((claim) => claim.status === "approved").length || 0
  const pendingClaims = roleplay?.claims?.filter((claim) => claim.status === "pending").length || 0

  useEffect(() => {
    if (characters.length && !characters.some((character) => character.id === selectedCharacterId)) {
      setSelectedCharacterId(characters[0].id)
    }
  }, [characters, selectedCharacterId])

  useEffect(() => {
    if (access === "password" && isOwner) {
      setHasEnteredPasswordTavern(true)
      setNotice("店主身份已进入；管理功能折叠在右侧。")
      return
    }
    if (access === "password") return

    let cancelled = false
    setNotice("")
    enterTavern(tavern.id, "", visitorId, visitorGender)
      .then((result) => {
        if (cancelled) return
        setVisitorState(result.visitor_state ?? null)
        if (result.first_mes) setNotice("已进入酒馆，对话记录会持续写回记忆。")
      })
      .catch((err) => {
        if (cancelled) return
        setNotice(errorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [access, isOwner, tavern.id, visitorId])

  useEffect(() => {
    if (!selectedCharacter || passwordLocked) {
      setMessages([])
      return
    }

    let cancelled = false
    setHistoryError("")
    getTavernChatHistory(tavern.id, visitorId, selectedCharacter.id, visitorId, CHAT_HISTORY_LIMIT)
      .then((payload) => {
        if (cancelled) return
        setMessages(payload.messages || [])
      })
      .catch((err) => {
        if (cancelled) return
        setMessages([])
        setHistoryError(`聊天历史暂时不可用：${errorMessage(err)}`)
      })
    return () => {
      cancelled = true
    }
  }, [passwordLocked, selectedCharacter, tavern.id, visitorId])

  useEffect(() => {
    chatLogRef.current?.scrollTo({ top: chatLogRef.current.scrollHeight, behavior: "smooth" })
  }, [visibleMessages.length, busy])

  async function handlePasswordEnter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!password.trim()) return
    setBusy("enter")
    setError("")
    setNotice("")
    try {
      const result = await enterTavern(tavern.id, password.trim(), visitorId, visitorGender)
      setVisitorState(result.visitor_state ?? null)
      setHasEnteredPasswordTavern(true)
      setPassword("")
      setNotice(result.first_mes ? "密码通过，已进入酒馆。" : "密码通过。")
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy("")
    }
  }

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    const cleanMessage = message.trim()
    if (!selectedCharacter || !cleanMessage || passwordLocked) return

    const now = new Date().toISOString()
    const userLine: ChatMessage = {
      id: `local-user-${now}`,
      role: "user",
      content: cleanMessage,
      character_id: selectedCharacter.id,
      visitor_id: visitorId,
      visitor_name: visitorName,
      visitor_gender: visitorGender,
      timestamp: now,
    }
    setMessages((current) => [...current, userLine])
    setMessage("")
    setBusy("send")
    setError("")
    setNotice("")

    try {
      const result = await sendTavernChat(tavern.id, {
        character_id: selectedCharacter.id,
        visitor_id: visitorId,
        visitor_name: visitorName,
        visitor_gender: visitorGender,
        message: cleanMessage,
      })
      const assistantTime = new Date().toISOString()
      setMessages((current) => [
        ...current,
        {
          id: `local-assistant-${assistantTime}`,
          role: "assistant",
          content: result.response,
          character_id: selectedCharacter.id,
          visitor_id: visitorId,
          timestamp: assistantTime,
        },
      ])
      if (result.visitor_state !== undefined) {
        setVisitorState(result.visitor_state ?? null)
      }
      if (result.degradation?.message) {
        setNotice(result.degradation.message)
      } else if (result.degraded) {
        setNotice("当前为降级回复；店主可在管理页检查模型配置。")
      }
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy("")
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return
    event.preventDefault()
    void handleSubmit()
  }

  return (
    <section data-chat-workbench="sillytavern-style" className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/72 shadow-2xl shadow-cyan-950/20">
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_36%),rgba(15,23,42,0.92)] p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100/70">
                <Sparkles className="h-4 w-4" />
                Cyber tavern chat
              </p>
              <h1 className="mt-2 break-words text-3xl font-black tracking-tight text-white sm:text-4xl">{tavern.name}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-violet-50/70">
                {textOrFallback(tavern.description, "选择左侧 NPC 后，直接在底部输入框开始聊天。酒馆资料和其它功能已折叠到侧边。")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <WorkbenchChip>
                <DoorOpen className="h-3.5 w-3.5 text-cyan-200" />
                {textOrFallback(tavern.status, "unknown")} · {accessLabel(tavern.access)}
              </WorkbenchChip>
              <WorkbenchChip>
                <MapPin className="h-3.5 w-3.5 text-cyan-200" />
                {formatCoordinate(tavern.lat)}, {formatCoordinate(tavern.lon)}
              </WorkbenchChip>
              <WorkbenchChip>
                <UsersRound className="h-3.5 w-3.5 text-cyan-200" />
                {characters.length} NPC
              </WorkbenchChip>
            </div>
          </div>
        </div>

        <div className="grid min-h-[680px] grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)_21rem]">
          <aside className="border-b border-white/10 bg-white/[0.035] p-4 lg:border-b-0 lg:border-r" aria-label="NPC 角色列表">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-violet-100/45">Characters</p>
                <h2 className="text-base font-black text-white">选择 NPC</h2>
              </div>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-100">
                {characters.length}
              </span>
            </div>
            <div className="space-y-2">
              {characters.length ? (
                characters.map((character) => {
                  const active = character.id === selectedCharacter?.id
                  return (
                    <button
                      key={character.id}
                      type="button"
                      onClick={() => {
                        setSelectedCharacterId(character.id)
                        setError("")
                        setNotice("")
                      }}
                      className={`flex min-h-16 w-full min-w-0 items-center gap-3 rounded-3xl border p-3 text-left transition hover:border-cyan-300/35 hover:bg-cyan-300/8 ${
                        active ? "border-cyan-300/45 bg-cyan-300/12" : "border-white/10 bg-slate-950/30"
                      }`}
                    >
                      <CharacterAvatar character={character} active={active} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black text-white">{character.name || character.id}</span>
                        <span className="mt-1 line-clamp-2 text-xs leading-5 text-violet-50/56">
                          {character.description || character.personality || character.scenario || "可对话角色"}
                        </span>
                      </span>
                    </button>
                  )
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-white/15 bg-slate-950/35 p-4 text-sm leading-6 text-violet-50/62">
                  这间酒馆还没有 NPC。店主可以在管理入口导入 SillyTavern 兼容角色卡。
                </div>
              )}
            </div>
          </aside>

          <main className="flex min-h-[680px] min-w-0 flex-col bg-slate-950/35">
            <div className="flex min-w-0 items-center gap-3 border-b border-white/10 p-4">
              <CharacterAvatar character={selectedCharacter} active />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-black text-white">{selectedCharacter?.name || "暂无 NPC"}</p>
                <p className="truncate text-xs text-violet-100/56">
                  {selectedCharacter ? `${roleplayModeLabel(String(roleplayMode))} · ${genderLabel(selectedCharacter.gender)}` : "请先添加角色"}
                </p>
              </div>
              <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-violet-50/62 sm:inline-flex">
                Shift+Enter 换行
              </span>
            </div>

            {passwordLocked ? (
              <form onSubmit={handlePasswordEnter} className="m-4 rounded-3xl border border-amber-300/25 bg-amber-300/10 p-4">
                <div className="flex items-start gap-3">
                  <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-amber-100" />
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-amber-50">这间酒馆需要密码</p>
                    <p className="mt-1 text-sm leading-6 text-amber-50/72">输入店主提供的密码后即可加载聊天记录并开始对话。</p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        type="password"
                        className="min-h-12 flex-1 rounded-2xl border border-white/12 bg-slate-950/55 px-4 text-white outline-none focus:border-amber-200/70"
                        placeholder="酒馆密码"
                      />
                      <Button type="submit" disabled={busy === "enter" || !password.trim()}>
                        <DoorOpen className="h-4 w-4" />
                        进入酒馆
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            ) : null}

            <div ref={chatLogRef} aria-label="聊天记录" className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {visibleMessages.map((line, index) => {
                const isUser = line.role === "user"
                return (
                  <div key={line.id || `${line.role}-${index}`} className={`flex min-w-0 ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[86%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 shadow-lg ${
                        isUser
                          ? "rounded-br-md bg-cyan-300/18 text-cyan-50 shadow-cyan-950/20"
                          : "rounded-bl-md border border-white/10 bg-white/[0.07] text-violet-50 shadow-black/20"
                      }`}
                    >
                      <p className="mb-1 text-xs font-black uppercase tracking-[0.16em] text-violet-100/44">
                        {isUser ? visitorName || visitorId : selectedCharacter?.name || "NPC"}
                        {formatChatTime(line.timestamp) ? <span className="ml-2 font-semibold normal-case tracking-normal">{formatChatTime(line.timestamp)}</span> : null}
                      </p>
                      <p className="whitespace-pre-wrap break-words">{line.content}</p>
                    </div>
                  </div>
                )
              })}
              {busy === "send" ? (
                <div className="flex justify-start">
                  <div className="rounded-[1.35rem] rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-violet-50/68">
                    {selectedCharacter?.name || "NPC"} 正在回复…
                  </div>
                </div>
              ) : null}
            </div>

            {(notice || error) && !passwordLocked ? (
              <div className="border-t border-white/10 px-4 py-3">
                {notice ? <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm leading-6 text-cyan-50">{notice}</p> : null}
                {error ? <p className="mt-2 rounded-2xl border border-red-300/25 bg-red-300/10 p-3 text-sm leading-6 text-red-50">{error}</p> : null}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="border-t border-white/10 bg-slate-950/70 p-4">
              <div className="mb-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem]">
                <label className="min-w-0">
                  <span className="sr-only">显示名</span>
                  <input
                    value={visitorName}
                    onChange={(event) => setVisitorName(event.target.value)}
                    className="min-h-11 w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 text-sm text-white outline-none focus:border-cyan-300/60"
                    placeholder="显示名"
                  />
                </label>
                <label>
                  <span className="sr-only">性别</span>
                  <select
                    value={visitorGender}
                    onChange={(event) => setVisitorGender(normalizeGender(event.target.value))}
                    className="min-h-11 w-full rounded-2xl border border-white/12 bg-slate-950 px-4 text-sm text-white outline-none focus:border-cyan-300/60"
                  >
                    {GENDER_OPTIONS.map((option: { value: string; label: string }) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  disabled={!selectedCharacter || busy === "send" || passwordLocked}
                  rows={2}
                  maxLength={1600}
                  placeholder="Type a message，按 Enter 发送；Shift+Enter 换行"
                  className="min-h-14 flex-1 resize-none rounded-3xl border border-white/12 bg-white/[0.06] px-5 py-3 text-sm leading-6 text-white outline-none placeholder:text-violet-100/35 focus:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-55"
                />
                <Button type="submit" disabled={!selectedCharacter || busy === "send" || passwordLocked || !message.trim()} className="min-h-14 sm:w-28">
                  <Send className="h-4 w-4" />
                  发送
                </Button>
              </div>
            </form>
          </main>

          <aside className="space-y-4 border-t border-white/10 bg-white/[0.03] p-4 lg:border-l lg:border-t-0">
            <DetailSection title="酒馆信息" description="真实地图锚点与公开说明" defaultOpen>
              <div className="space-y-3 text-sm leading-6 text-violet-50/72">
                <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                  <MapPin className="mr-2 inline h-4 w-4 text-cyan-200" />
                  {textOrFallback(tavern.address, "坐标门牌")} · {formatCoordinate(tavern.lat)}, {formatCoordinate(tavern.lon)}
                </p>
                <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                  <DoorOpen className="mr-2 inline h-4 w-4 text-cyan-200" />
                  {textOrFallback(tavern.status, "unknown")} · {accessLabel(tavern.access)} · {roleplayModeLabel(String(roleplayMode))}
                </p>
                {tavern.scene_prompt ? (
                  <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">{tavern.scene_prompt}</p>
                ) : null}
              </div>
            </DetailSection>

            <DetailSection title="对话记忆" description="当前访客的身份与回访状态">
              <VisitorMemoryPanel
                visitorId={visitorId}
                visitorName={visitorName}
                visitorGender={visitorGender}
                visitorState={visitorState}
                historyError={historyError}
              />
            </DetailSection>

            <DetailSection title="更多酒馆功能" description="分享、街区传闻和回访反馈先折叠收纳">
              {publicPanel || (
                <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-3 text-sm leading-6 text-violet-50/62">
                  暂无额外公开功能。
                </p>
              )}
            </DetailSection>

            {isOwner && ownerPanel ? (
              <details data-owner-only-panel className="group rounded-3xl border border-cyan-300/20 bg-cyan-300/8 p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left">
                  <span>
                    <span className="flex items-center gap-2 text-sm font-black text-cyan-50">
                      <ShieldCheck className="h-4 w-4" />
                      店主管理
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-cyan-50/64">
                      只有酒馆 owner 可见 · 批准 {approvedClaims} · 待处理 {pendingClaims}
                    </span>
                  </span>
                  <Settings2 className="h-4 w-4 shrink-0 text-cyan-100 transition-transform group-open:rotate-90" />
                </summary>
                <div className="mt-4 space-y-4">{ownerPanel}</div>
              </details>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 text-sm leading-6 text-violet-50/56">
                <UserCircle2 className="mr-2 inline h-4 w-4 text-violet-100/55" />
                管理入口仅酒馆所有人可见；访客首屏只保留聊天主线。
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}

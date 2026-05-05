import type { ClientLoaderFunctionArgs } from "react-router"
import { ArrowRight, CheckCircle2, Copy, Send, Share2, ShieldCheck, UserCheck, XCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useLoaderData } from "react-router"

import { TavernChatWorkbench } from "../features/tavern-chat-workbench"
import { NeighborhoodRumorBubble } from "../components/NeighborhoodRumorBubble"
import { TavernActivitySignalsCard } from "../components/TavernActivitySignalsCard"
import { buildCreatorConversionLink, buildCreatorProfileLink } from "../lib/creator-conversion.js"
import { buildTavernShareDisplay, buildTavernSharePayload } from "../lib/tavern-share.js"
import {
  addHomeMember,
  createPlaceRelationship,
  createVisitorNote,
  createSchoolEnrollment,
  DEFAULT_OWNER_ID,
  DEFAULT_VISITOR_ID,
  deleteVisitorNote,
  decideRoleplayClaim,
  decidePlaceRelationship,
  errorMessage,
  getRoleplayState,
  getTavern,
  getTavernShare,
  listVisitorNotes,
  requestRoleplayClaim,
  saveRoleplayConfig,
  type HomeMember,
  type PlaceRelationship,
  type RoleplayClaim,
  type RoleplayState,
  type Tavern,
  type TavernCharacter,
  type TavernSharePayload,
  type TavernVisitorNote,
} from "../lib/taverns"
import { PLACE_RELATIONSHIP_TYPES, normalizePlaceRelationshipDraft } from "../lib/place-home.js"
import { ProductShell } from "../shell/product-shell"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

type TavernLoaderData = {
  tavernId: string
  currentUserId: string
  tavern: Tavern | null
  roleplay: RoleplayState | null
  error: string
}

function getCurrentUserIdFromRequest(request: Request) {
  const url = new URL(request.url)
  return (
    url.searchParams.get("user_id")?.trim() ||
    url.searchParams.get("owner_id")?.trim() ||
    url.searchParams.get("visitor_id")?.trim() ||
    DEFAULT_VISITOR_ID
  )
}

export async function clientLoader({ params, request }: ClientLoaderFunctionArgs): Promise<TavernLoaderData> {
  const tavernId = params.tavernId ?? ""
  const currentUserId = getCurrentUserIdFromRequest(request)
  if (!tavernId) {
    return { tavernId, currentUserId, tavern: null, roleplay: null, error: "缺少酒馆 ID" }
  }
  try {
    const tavern = await getTavern(tavernId, currentUserId)
    let roleplay: RoleplayState | null = null
    try {
      roleplay = await getRoleplayState(tavernId, currentUserId)
    } catch {
      roleplay = null
    }
    return { tavernId, currentUserId, tavern, roleplay, error: "" }
  } catch (error) {
    return { tavernId, currentUserId, tavern: null, roleplay: null, error: errorMessage(error) }
  }
}

function fallbackRoleplayState(tavern: Tavern, characters: TavernCharacter[]): RoleplayState {
  return {
    tavern_id: tavern.id,
    roleplay_mode: tavern.roleplay_mode || "ai_only",
    claims: tavern.character_claims || [],
    characters: characters.map((character) => ({
      id: character.id,
      name: character.name,
      avatar: character.avatar,
    })),
  }
}

function characterName(characters: TavernCharacter[], characterId: string) {
  return characters.find((character) => character.id === characterId)?.name || characterId
}

function RoleplayPanel({
  tavern,
  characters,
  roleplay,
  onRoleplayChange,
}: {
  tavern: Tavern
  characters: TavernCharacter[]
  roleplay: RoleplayState
  onRoleplayChange: (state: RoleplayState) => void
}) {
  const [ownerId, setOwnerId] = useState(tavern.owner_id || DEFAULT_OWNER_ID)
  const [visitorId, setVisitorId] = useState(DEFAULT_VISITOR_ID)
  const [playerName, setPlayerName] = useState("Demo performer")
  const [mode, setMode] = useState(String(roleplay.roleplay_mode || "ai_only"))
  const [characterId, setCharacterId] = useState(characters[0]?.id || "")
  const [busy, setBusy] = useState("")
  const [message, setMessage] = useState("")

  const claims = roleplay.claims || []
  const pendingClaims = claims.filter((claim) => claim.status === "pending")
  const approvedClaims = claims.filter((claim) => claim.status === "approved")
  const hybridEnabled = roleplay.roleplay_mode === "hybrid"

  async function run(action: string, task: () => Promise<RoleplayState>, success: string) {
    setBusy(action)
    setMessage("")
    try {
      const next = await task()
      onRoleplayChange(next)
      setMode(String(next.roleplay_mode || "ai_only"))
      setMessage(success)
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy("")
    }
  }

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Player NPC roleplay</CardTitle>
            <CardDescription className="mt-2">
              Mode: <span className="font-bold text-cyan-100">{roleplay.roleplay_mode}</span> · Approved: {approvedClaims.length} · Pending: {pendingClaims.length}
            </CardDescription>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/24 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">
            <UserCheck className="h-3.5 w-3.5" />
            Tavern scoped
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <label className="min-w-0 space-y-1.5 text-sm">
            <span className="text-violet-100/65">Owner ID</span>
            <input value={ownerId} onChange={(event) => setOwnerId(event.target.value)} className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="text-violet-100/65">Mode</span>
            <select value={mode} onChange={(event) => setMode(event.target.value)} className="w-full rounded-2xl border border-white/12 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300/60">
              <option value="ai_only">ai_only</option>
              <option value="hybrid">hybrid</option>
            </select>
          </label>
          <Button
            type="button"
            disabled={busy === "mode"}
            className="md:col-span-2"
            onClick={() => run("mode", () => saveRoleplayConfig(tavern.id, { roleplay_mode: mode }, ownerId), "Roleplay mode saved.")}
          >
            <ShieldCheck className="h-4 w-4" />
            Save mode
          </Button>
        </div>

        <div className="grid min-w-0 gap-3 md:grid-cols-2">
          <label className="min-w-0 space-y-1.5 text-sm">
            <span className="text-violet-100/65">Visitor ID</span>
            <input value={visitorId} onChange={(event) => setVisitorId(event.target.value)} className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
          </label>
          <label className="min-w-0 space-y-1.5 text-sm">
            <span className="text-violet-100/65">Player name</span>
            <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
          </label>
          <label className="min-w-0 space-y-1.5 text-sm md:col-span-2">
            <span className="text-violet-100/65">NPC role</span>
            <select value={characterId} onChange={(event) => setCharacterId(event.target.value)} className="w-full rounded-2xl border border-white/12 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300/60">
              {characters.map((character) => (
                <option key={character.id} value={character.id}>{character.name || character.id}</option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            disabled={!hybridEnabled || !characterId || busy === "claim"}
            className="md:col-span-2"
            onClick={() => run("claim", () => requestRoleplayClaim(tavern.id, { character_id: characterId, player_name: playerName }, visitorId), "Claim request sent.")}
          >
            <Send className="h-4 w-4" />
            Request claim
          </Button>
        </div>

        {claims.length ? (
          <div className="space-y-2">
            {claims.map((claim: RoleplayClaim) => (
              <div key={claim.id} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-sm font-bold text-white">{characterName(characters, claim.character_id)} · {claim.player_name || claim.player_id}</p>
                  <p className="mt-1 text-xs text-violet-100/55">{claim.status} · {claim.id}</p>
                </div>
                {claim.status === "pending" ? (
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button type="button" size="sm" disabled={busy === claim.id} onClick={() => run(claim.id, () => decideRoleplayClaim(tavern.id, claim.id, { status: "approved" }, ownerId), "Claim approved.")}>
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button type="button" size="sm" variant="secondary" disabled={busy === claim.id} onClick={() => run(claim.id, () => decideRoleplayClaim(tavern.id, claim.id, { status: "rejected" }, ownerId), "Claim rejected.")}>
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-violet-100/62">No roleplay claims yet.</p>
        )}

        {message ? <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-50">{message}</p> : null}
      </CardContent>
    </Card>
  )
}

function TavernShareCard({ tavern }: { tavern: Tavern }) {
  const [copyStatus, setCopyStatus] = useState("")
  const [shareStatus, setShareStatus] = useState("正在同步公开分享信息…")
  const [serverSharePayload, setServerSharePayload] = useState<TavernSharePayload | null>(null)
  const fallbackSharePayload = useMemo(
    () => buildTavernSharePayload(tavern, {
      origin: typeof window !== "undefined" ? window.location.origin : "",
    }),
    [tavern],
  )
  const sharePayload = useMemo(
    () => (serverSharePayload ? buildTavernShareDisplay(serverSharePayload) : fallbackSharePayload),
    [fallbackSharePayload, serverSharePayload],
  )

  useEffect(() => {
    let cancelled = false
    setShareStatus("正在同步公开分享信息…")
    setServerSharePayload(null)

    getTavernShare(tavern.id, DEFAULT_VISITOR_ID)
      .then((payload) => {
        if (cancelled) return
        setServerSharePayload(payload)
        setShareStatus("")
      })
      .catch(() => {
        if (cancelled) return
        setShareStatus("当前使用本地邀请文案；公开分享接口暂不可用。")
      })

    return () => {
      cancelled = true
    }
  }, [tavern.id])

  async function handleCopyShareText() {
    setCopyStatus("")
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        setCopyStatus("当前浏览器不支持自动复制，请手动选中文案复制。")
        return
      }
      await navigator.clipboard.writeText(sharePayload.copyText)
      setCopyStatus("已复制邀请文案。")
    } catch {
      setCopyStatus("当前浏览器不允许自动复制，请手动选中文案复制。")
    }
  }

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-cyan-200" />
              邀请链接
            </CardTitle>
            <CardDescription className="mt-2">
              复制当前酒馆入口给朋友或社群。文案只使用店主公开填写的信息，不生成或改写酒馆内容。
            </CardDescription>
          </div>
          <Button type="button" variant="secondary" onClick={handleCopyShareText}>
            <Copy className="h-4 w-4" />
            复制邀请
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-bold text-white">{sharePayload.title}</p>
          <p className="mt-2 text-sm leading-6 text-violet-50/70">{sharePayload.summary}</p>
          {sharePayload.characters ? (
            <p className="mt-2 text-sm font-bold text-cyan-100">
              <span className="text-violet-100/55">NPC：</span>{sharePayload.characters}
            </p>
          ) : null}
          <p className="mt-3 break-all rounded-2xl bg-slate-950/45 px-3 py-2 text-xs text-cyan-100">
            {sharePayload.url}
          </p>
        </div>
        <textarea
          readOnly
          value={sharePayload.copyText}
          rows={4}
          className="w-full resize-none rounded-2xl border border-white/12 bg-slate-950/70 px-4 py-3 text-sm leading-6 text-violet-50 outline-none focus:border-cyan-300/60"
          aria-label="酒馆邀请文案"
        />
        {shareStatus ? <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-violet-50/64">{shareStatus}</p> : null}
        {copyStatus ? <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-50">{copyStatus}</p> : null}
      </CardContent>
    </Card>
  )
}

function CreatorConversionCard({ tavern }: { tavern: Tavern }) {
  const createLink = useMemo(() => buildCreatorConversionLink(tavern), [tavern])

  return (
    <Card className="min-w-0 overflow-hidden border-cyan-300/18 bg-cyan-300/8">
      <CardHeader>
        <CardTitle>也在附近开一间自己的酒馆</CardTitle>
        <CardDescription className="mt-2">
          只带入这处真实空间锚点的坐标/地址，不复制原酒馆名称、简介、角色或场景内容。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="rounded-2xl border border-white/10 bg-slate-950/45 p-3 text-sm leading-6 text-violet-50/72">
          如果这间酒馆让你有了灵感，可以用同一片现实区域开一间属于自己的赛博酒馆；内容仍由你自己确认。
        </p>
        <Button asChild>
          <Link to={createLink}>
            开自己的酒馆
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function VisitorNotesPanel({ tavern }: { tavern: Tavern }) {
  const [visitorId, setVisitorId] = useState(DEFAULT_VISITOR_ID)
  const [nickname, setNickname] = useState("旅人")
  const [content, setContent] = useState("")
  const [ownerId, setOwnerId] = useState(tavern.owner_id || DEFAULT_OWNER_ID)
  const [notes, setNotes] = useState<TavernVisitorNote[]>([])
  const [count, setCount] = useState(0)
  const [busy, setBusy] = useState("")
  const [message, setMessage] = useState("")

  async function handleSubmitNote() {
    setBusy("create")
    setMessage("")
    try {
      await createVisitorNote(tavern.id, { visitor_nickname: nickname, content }, visitorId)
      setContent("")
      setMessage("已发送给店主。你的反馈不会成为公开留言墙。")
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy("")
    }
  }

  async function handleLoadOwnerNotes() {
    setBusy("list")
    setMessage("")
    try {
      const payload = await listVisitorNotes(tavern.id, { limit: 20 }, ownerId)
      setNotes(payload.notes || [])
      setCount(payload.count || 0)
      setMessage("已加载店主可见反馈。")
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy("")
    }
  }

  async function handleDeleteNote(noteId: string) {
    setBusy(noteId)
    setMessage("")
    try {
      await deleteVisitorNote(tavern.id, noteId, ownerId)
      setNotes((current) => current.filter((note) => note.id !== noteId))
      setCount((current) => Math.max(0, current - 1))
      setMessage("反馈已删除。")
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy("")
    }
  }

  return (
    <Card className="mt-6 min-w-0 overflow-hidden border-violet-300/18 bg-violet-300/8">
      <CardHeader>
        <CardTitle>给店主的回访反馈</CardTitle>
        <CardDescription className="mt-2">
          这不是公开留言墙：反馈只发送给本酒馆店主，不支持访客互相回复、点赞或私信。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="text-violet-100/65">Visitor ID</span>
            <input value={visitorId} onChange={(event) => setVisitorId(event.target.value)} className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="text-violet-100/65">昵称</span>
            <input value={nickname} onChange={(event) => setNickname(event.target.value)} className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
          </label>
          <label className="space-y-1.5 text-sm md:col-span-2">
            <span className="text-violet-100/65">反馈内容</span>
            <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={3} maxLength={500} placeholder="告诉店主这次回访的感受，或希望下次看到什么。" className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
          </label>
          <Button type="button" disabled={!content.trim() || busy === "create"} className="md:col-span-2" onClick={handleSubmitNote}>
            发送给店主
          </Button>
        </div>

        <details className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-violet-100/70">店主查看反馈</summary>
          <div className="mt-4 space-y-3">
            <label className="space-y-1.5 text-sm">
              <span className="text-violet-100/65">Owner ID</span>
              <input value={ownerId} onChange={(event) => setOwnerId(event.target.value)} className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
            </label>
            <Button type="button" variant="secondary" disabled={busy === "list"} onClick={handleLoadOwnerNotes}>
              加载店主反馈 ({count})
            </Button>
            {notes.map((note) => (
              <div key={note.id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                <p className="text-sm leading-6 text-violet-50/78">{note.content}</p>
                <p className="mt-2 text-xs text-violet-100/45">{note.visitor_nickname} · {note.created_at}</p>
                <Button type="button" size="sm" variant="secondary" className="mt-3" disabled={busy === note.id} onClick={() => handleDeleteNote(note.id)}>
                  删除反馈
                </Button>
              </div>
            ))}
          </div>
        </details>

        {message ? <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-50">{message}</p> : null}
      </CardContent>
    </Card>
  )
}

function PlaceHomePanel({ tavern }: { tavern: Tavern }) {
  const [ownerId, setOwnerId] = useState(tavern.owner_id || DEFAULT_OWNER_ID)
  const [memberName, setMemberName] = useState("")
  const [memberType, setMemberType] = useState("silent_member")
  const [memberDescription, setMemberDescription] = useState("")
  const [members, setMembers] = useState<HomeMember[]>(tavern.home_members || [])
  const [selectedMemberId, setSelectedMemberId] = useState((tavern.home_members || [])[0]?.id || "")
  const [targetTavernId, setTargetTavernId] = useState("")
  const [relationType, setRelationType] = useState("school_enrollment")
  const [pendingRelationships, setPendingRelationships] = useState<PlaceRelationship[]>(tavern.pending_place_relationships || tavern.pending_school_enrollments || [])
  const [schoolMembers, setSchoolMembers] = useState(tavern.school_members || [])
  const [busy, setBusy] = useState("")
  const [message, setMessage] = useState("")
  const isHome = tavern.place_type === "home"
  const isSchool = tavern.place_type === "school"
  const hasTargetRelationships = Boolean((tavern.target_place_relationships || tavern.pending_place_relationships || []).length)

  async function handleAddMember() {
    setBusy("member")
    setMessage("")
    try {
      const payload = await addHomeMember(
        tavern.id,
        { name: memberName, display_name: memberName, member_type: memberType, description: memberDescription },
        ownerId,
      )
      setMembers(payload.members || [])
      setSelectedMemberId(payload.member?.id || selectedMemberId)
      setMemberName("")
      setMemberDescription("")
      setMessage("家庭成员已保存；非对话成员会保持沉默。")
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy("")
    }
  }

  async function handleCreateRelationship() {
    setBusy("enroll")
    setMessage("")
    try {
      const draft = normalizePlaceRelationshipDraft({
        member_id: selectedMemberId,
        target_tavern_id: targetTavernId,
        relation_type: relationType,
      })
      const payload = relationType === "school_enrollment" ? await createSchoolEnrollment(
        tavern.id,
        { member_id: selectedMemberId, school_tavern_id: draft.target_tavern_id },
        ownerId,
      ) : await createPlaceRelationship(
        tavern.id,
        draft,
        ownerId,
      )
      setMessage(payload.relationship.status === "approved" ? "同主人地点关系已同步。" : "已提交目标地点审批，批准前不会公开展示。")
      setTargetTavernId("")
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy("")
    }
  }

  async function handleDecision(relationship: PlaceRelationship, status: "approved" | "rejected") {
    setBusy(relationship.id)
    setMessage("")
    try {
      const payload = await decidePlaceRelationship(tavern.id, relationship.id, { status }, ownerId)
      setPendingRelationships((current) => current.filter((item) => item.id !== relationship.id))
      if (payload.relationship.status === "approved" && payload.relationship.relation_type === "school_enrollment") {
        setSchoolMembers((current) => [
          ...current,
          {
            relationship_id: payload.relationship.id,
            home_tavern_id: payload.relationship.source_tavern_id,
            member_id: payload.relationship.source_member_id,
            display_name: payload.relationship.display_name || payload.relationship.source_member_id,
            member_type: "silent_member",
          },
        ])
      }
      setMessage(status === "approved" ? "已批准入学关系。" : "已拒绝入学关系。")
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy("")
    }
  }

  if (!isHome && !isSchool && !hasTargetRelationships) return null

  return (
    <Card className="mt-6 min-w-0 overflow-hidden border-cyan-300/18 bg-cyan-300/8">
      <CardHeader>
        <CardTitle>{isHome ? "Home 成员与地点关系" : isSchool ? "学校成员审批" : "地点关系审批"}</CardTitle>
        <CardDescription className="mt-2">
          {isHome
            ? "Home 是受控真实坐标空间。家庭成员默认不对话；学生-学校只是关系类型之一，送往其他地点也会先生成审批关系。"
            : isSchool
              ? "学校只展示已批准的成员摘要；跨主人入学必须由学校主人批准。"
              : "目标地点只处理 owner 可见的待审批关系；这不是好友、私信或公开社交图谱。"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="space-y-1.5 text-sm">
          <span className="text-violet-100/65">Owner ID</span>
          <input value={ownerId} onChange={(event) => setOwnerId(event.target.value)} className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
        </label>

        {isHome ? (
          <>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              <label className="space-y-1.5 text-sm">
                <span className="text-violet-100/65">成员名称</span>
                <input value={memberName} onChange={(event) => setMemberName(event.target.value)} placeholder="小石头 / 孩子 / 宠物 / 纪念物" className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-violet-100/65">成员类型</span>
                <select value={memberType} onChange={(event) => setMemberType(event.target.value)} className="w-full rounded-2xl border border-white/12 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300/60">
                  <option value="silent_member">silent_member</option>
                  <option value="display_object">display_object</option>
                  <option value="conversational_character">conversational_character</option>
                </select>
              </label>
              <label className="space-y-1.5 text-sm md:col-span-2">
                <span className="text-violet-100/65">描述</span>
                <input value={memberDescription} onChange={(event) => setMemberDescription(event.target.value)} placeholder="主人确认的展示描述，不自动生成人格。" className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
              </label>
              <Button type="button" disabled={!memberName.trim() || busy === "member"} className="md:col-span-2" onClick={handleAddMember}>
                添加 Home 成员
              </Button>
            </div>

            <div className="grid gap-2">
              {members.length ? members.map((member) => (
                <div key={member.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-violet-50/72">
                  <span className="font-bold text-white">{member.display_name || member.name}</span>
                  <span className="ml-2 text-xs text-violet-100/50">{member.member_type} · {member.speech_mode}</span>
                </div>
              )) : (
                <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-violet-100/62">还没有 Home 成员。</p>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1.5 text-sm">
                <span className="text-violet-100/65">送去学校的成员</span>
                <select value={selectedMemberId} onChange={(event) => setSelectedMemberId(event.target.value)} className="w-full rounded-2xl border border-white/12 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300/60">
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>{member.display_name || member.name}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-violet-100/65">关系类型</span>
                <select value={relationType} onChange={(event) => setRelationType(event.target.value)} className="w-full rounded-2xl border border-white/12 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300/60">
                  {PLACE_RELATIONSHIP_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm md:col-span-2">
                <span className="text-violet-100/65">目标地点 Tavern ID</span>
                <input value={targetTavernId} onChange={(event) => setTargetTavernId(event.target.value)} placeholder="tavern_xxx" className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
              </label>
              <Button type="button" disabled={!selectedMemberId || !targetTavernId.trim() || busy === "enroll"} className="md:col-span-2" onClick={handleCreateRelationship}>
                创建地点关系
              </Button>
            </div>
          </>
        ) : null}

        {isSchool || hasTargetRelationships ? (
          <>
            <div className="grid gap-2">
              <p className="text-sm font-black text-white">已批准成员 ({schoolMembers.length})</p>
              {schoolMembers.length ? schoolMembers.map((member) => (
                <div key={member.relationship_id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-violet-50/72">
                  <span className="font-bold text-white">{member.display_name}</span>
                  <span className="ml-2 text-xs text-violet-100/50">{member.member_type}</span>
                </div>
              )) : <p className="text-sm text-violet-100/55">暂无已批准成员。</p>}
            </div>
            <div className="grid gap-2">
              <p className="text-sm font-black text-white">待审批 ({pendingRelationships.length})</p>
              {pendingRelationships.map((relationship) => (
                <div key={relationship.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-white">{relationship.display_name || relationship.source_member_id}</p>
                    <p className="text-xs text-violet-100/50">{relationship.relation_type} · {relationship.source_tavern_id} → {relationship.target_tavern_id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" disabled={busy === relationship.id} onClick={() => handleDecision(relationship, "approved")}>批准</Button>
                    <Button type="button" size="sm" variant="secondary" disabled={busy === relationship.id} onClick={() => handleDecision(relationship, "rejected")}>拒绝</Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {message ? <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-50">{message}</p> : null}
      </CardContent>
    </Card>
  )
}

export default function TavernRoute() {
  const { tavernId, currentUserId, tavern, roleplay, error } = useLoaderData<typeof clientLoader>()
  const characters = tavern?.characters || []
  const [roleplayState, setRoleplayState] = useState<RoleplayState | null>(roleplay)
  const effectiveRoleplay = tavern ? roleplayState || fallbackRoleplayState(tavern, characters) : null
  const isOwner = Boolean(tavern?.owner_id && tavern.owner_id === currentUserId)

  return (
    <ProductShell eyebrow="Tavern">
      <div id="tavern-mainline" className="scroll-mt-28">
        {tavern ? (
          <TavernChatWorkbench
            tavern={tavern}
            roleplay={effectiveRoleplay}
            currentUserId={currentUserId}
            isOwner={isOwner}
            publicPanel={
              <div className="space-y-4">
                <TavernShareCard tavern={tavern} />
                <TavernActivitySignalsCard tavern={tavern} />
                <NeighborhoodRumorBubble tavernId={tavern.id} limit={3} />
                <CreatorConversionCard tavern={tavern} />
              </div>
            }
            ownerPanel={isOwner && effectiveRoleplay ? (
              <div className="space-y-4">
                <RoleplayPanel
                  tavern={tavern}
                  characters={characters}
                  roleplay={effectiveRoleplay}
                  onRoleplayChange={setRoleplayState}
                />
                <PlaceHomePanel tavern={tavern} />
                <VisitorNotesPanel tavern={tavern} />
              </div>
            ) : null}
          />
        ) : (
          <Card className="min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle>无法进入酒馆</CardTitle>
              <CardDescription className="mt-2">
                {error || `未找到酒馆 ${tavernId}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-violet-50/70">
                请确认酒馆链接、访问权限或当前用户身份。店主可从管理页进入并携带 owner_id。
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ProductShell>
  )
}

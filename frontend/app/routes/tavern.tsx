import type { ClientLoaderFunctionArgs } from "react-router"
import { ArrowRight, Copy, Share2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useLoaderData } from "react-router"

import { TavernChatWorkbench } from "../features/tavern-chat-workbench"
import { NeighborhoodRumorBubble } from "../components/NeighborhoodRumorBubble"
import { TavernEngagementPanel } from "../components/TavernEngagementPanel"
import { buildCreatorConversionLink } from "../lib/creator-conversion.js"
import { DIGITAL_HUMAN_STUDIO_TYPE_ID } from "../lib/digital-human-studio.js"
import { fallbackRoleplayState } from "../lib/roleplay-state"
import { deriveSpecialTavernTypeDisplay } from "../lib/special-tavern-types.js"
import { buildTavernShareDisplay, buildTavernSharePayload } from "../lib/tavern-share.js"
import {
  createVisitorNote,
  DEFAULT_VISITOR_ID,
  errorMessage,
  getRoleplayState,
  getTavern,
  getTavernShare,
  type RoleplayState,
  type Tavern,
  type TavernSharePayload,
} from "../lib/taverns"
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
    return { tavernId, currentUserId, tavern: null, roleplay: null, error: "缺少空间 ID" }
  }
  try {
    const tavern = await getTavern(tavernId, currentUserId, { view: "entry" })
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
              <Share2 className="h-5 w-5 text-theme-accent-text" />
              邀请链接
            </CardTitle>
            <CardDescription className="mt-2">
              复制当前空间入口给朋友或社群。文案只使用店主公开填写的信息，不生成或改写空间内容。
            </CardDescription>
          </div>
          <Button type="button" variant="secondary" onClick={handleCopyShareText}>
            <Copy className="h-4 w-4" />
            复制邀请
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-3xl border border-theme-border bg-theme-card p-4">
          <p className="text-sm font-bold text-theme-primary">{sharePayload.title}</p>
          <p className="mt-2 text-sm leading-6 text-violet-50/70">{sharePayload.summary}</p>
          {sharePayload.characters ? (
            <p className="mt-2 text-sm font-bold text-theme-accent-text">
              <span className="text-theme-muted">NPC：</span>{sharePayload.characters}
            </p>
          ) : null}
          <p className="mt-3 break-all rounded-2xl bg-theme-card px-3 py-2 text-xs text-theme-accent-text">
            {sharePayload.url}
          </p>
        </div>
        <textarea
          readOnly
          value={sharePayload.copyText}
          rows={4}
          className="w-full resize-none rounded-2xl border border-theme-border bg-theme-card px-4 py-3 text-sm leading-6 text-violet-50 outline-none focus:border-theme-accent-border"
          aria-label="空间邀请文案"
        />
        {shareStatus ? <p className="rounded-2xl border border-theme-border bg-theme-card p-3 text-sm text-violet-50/64">{shareStatus}</p> : null}
        {copyStatus ? <p className="rounded-2xl border border-theme-accent-border bg-theme-accent-bg p-3 text-sm text-theme-accent-text">{copyStatus}</p> : null}
      </CardContent>
    </Card>
  )
}

function CreatorConversionCard({ tavern }: { tavern: Tavern }) {
  const createLink = useMemo(() => buildCreatorConversionLink(tavern), [tavern])

  return (
    <Card className="min-w-0 overflow-hidden border-theme-accent-border bg-theme-accent-bg">
      <CardHeader>
        <CardTitle>也在附近开一间自己的空间</CardTitle>
        <CardDescription className="mt-2">
          只带入这处真实空间锚点的坐标/地址，不复制原空间名称、简介、角色或场景内容。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="rounded-2xl border border-theme-border bg-theme-card p-3 text-sm leading-6 text-violet-50/72">
          如果这间空间让你有了灵感，可以用同一片现实区域开一间属于自己的空间；内容仍由你自己确认。
        </p>
        <Button asChild>
          <Link to={createLink}>
            开自己的空间
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function SpecialTavernTypeCard({ tavern }: { tavern: Tavern }) {
  const specialTavernType = deriveSpecialTavernTypeDisplay(tavern)

  if (!specialTavernType) return null
  const isDigitalHumanStudio = specialTavernType.id === DIGITAL_HUMAN_STUDIO_TYPE_ID

  return (
    <Card data-special-tavern-type-card={specialTavernType.id} className="min-w-0 overflow-hidden border-amber-300/18 bg-amber-300/8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span aria-hidden="true">{specialTavernType.icon}</span>
          {specialTavernType.label}
        </CardTitle>
        <CardDescription className="mt-2">
          {specialTavernType.summary}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="rounded-2xl border border-theme-border bg-theme-card p-3 text-sm leading-6 text-violet-50/72">
          {specialTavernType.description}
        </p>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className={`rounded-full border px-2.5 py-1 ${specialTavernType.badgeClass}`}>
            layout_style={specialTavernType.layoutStyle}
          </span>
          <span className="rounded-full border border-theme-border bg-theme-card px-2.5 py-1 text-theme-muted">
            place_type={tavern.place_type || "tavern"}
          </span>
        </div>
        {isDigitalHumanStudio ? (
          <div className="rounded-2xl border border-cyan-300/18 bg-cyan-300/8 p-3 text-sm leading-6 text-cyan-50/78">
            <p className="font-bold text-cyan-50">可迁移数字人档案</p>
            <p className="mt-1">
              这里的 NPC 会辅助整理身份、口吻、外观风格和授权边界；确认后可映射为 FableMap / SillyTavern 角色卡，也可复制为视频 / 短剧出镜 prompt。
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function VisitorFeedbackCard({ tavern }: { tavern: Tavern }) {
  const [visitorId, setVisitorId] = useState(DEFAULT_VISITOR_ID)
  const [nickname, setNickname] = useState("旅人")
  const [content, setContent] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmitNote() {
    setBusy(true)
    setMessage("")
    try {
      await createVisitorNote(tavern.id, { visitor_nickname: nickname, content }, visitorId)
      setContent("")
      setMessage("已发送给店主。你的反馈不会成为公开留言墙。")
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="min-w-0 overflow-hidden border-violet-300/18 bg-violet-300/8">
      <CardHeader>
        <CardTitle>给店主的私密反馈</CardTitle>
        <CardDescription className="mt-2">
          这不是公开留言墙：反馈只发送给本空间店主，不支持访客互相回复、点赞或私信。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="text-theme-muted">Visitor ID</span>
            <input value={visitorId} onChange={(event) => setVisitorId(event.target.value)} className="w-full rounded-2xl border border-theme-border bg-theme-card px-4 py-3 text-theme-primary outline-none focus:border-theme-accent-border" />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="text-theme-muted">昵称</span>
            <input value={nickname} onChange={(event) => setNickname(event.target.value)} className="w-full rounded-2xl border border-theme-border bg-theme-card px-4 py-3 text-theme-primary outline-none focus:border-theme-accent-border" />
          </label>
        </div>
        <label className="space-y-1.5 text-sm">
          <span className="text-theme-muted">反馈内容</span>
          <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={3} maxLength={500} placeholder="告诉店主这次回访的感受，或希望下次看到什么。" className="w-full rounded-2xl border border-theme-border bg-theme-card px-4 py-3 text-theme-primary outline-none focus:border-theme-accent-border" />
        </label>
        <Button type="button" disabled={!content.trim() || busy} className="w-full" onClick={handleSubmitNote}>
          发送给店主
        </Button>
        {message ? <p className="rounded-2xl border border-theme-accent-border bg-theme-accent-bg p-3 text-sm text-theme-accent-text">{message}</p> : null}
      </CardContent>
    </Card>
  )
}

export default function TavernRoute() {
  const { tavernId, currentUserId, tavern, roleplay, error } = useLoaderData<typeof clientLoader>()
  const characters = tavern?.characters || []
  const effectiveRoleplay = tavern ? roleplay || fallbackRoleplayState(tavern, characters) : null
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
                <SpecialTavernTypeCard tavern={tavern} />
                <TavernEngagementPanel tavern={tavern} currentUserId={currentUserId} />
                <TavernShareCard tavern={tavern} />
                <NeighborhoodRumorBubble tavernId={tavern.id} limit={3} />
                <CreatorConversionCard tavern={tavern} />
                <VisitorFeedbackCard tavern={tavern} />
              </div>
            }
          />
        ) : (
          <Card className="min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle>无法进入空间</CardTitle>
              <CardDescription className="mt-2">
                {error || `未找到空间 ${tavernId}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="rounded-2xl border border-theme-border bg-theme-card p-4 text-sm leading-6 text-violet-50/70">
                请确认空间链接、访问权限或当前用户身份。店主可从管理页进入并携带 owner_id。
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ProductShell>
  )
}

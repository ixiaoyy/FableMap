import type { ClientLoaderFunctionArgs } from "react-router"
import { Copy, Share2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useLoaderData } from "react-router"

import { TavernChatWorkbench } from "../features/tavern-chat-workbench"
import { fallbackRoleplayState } from "../lib/roleplay-state"
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
        setShareStatus("当前先使用本地邀请文案；分享信息稍后再同步。")
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
              复制这间空间的入口给朋友。邀请文案只整理店主已经公开的内容。
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
          这条反馈只会送到店主那里，不会公开展示。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="text-theme-muted">你的访客标识</span>
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
                <TavernShareCard tavern={tavern} />
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
                请确认空间链接是否正确，或让店主重新分享入口。
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ProductShell>
  )
}

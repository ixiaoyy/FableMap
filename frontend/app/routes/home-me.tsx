/**
 * Personal center for visitor-wide assets and owner shortcuts.
 */

import type { ClientLoaderFunctionArgs } from "react-router"
import { ArrowRight, Coins, Compass, Gift, Home as HomeIcon, MapPinned, RefreshCcw, ShieldCheck, Ticket, UserRound } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useLoaderData } from "react-router"

import { getVisitorEngagement, type VisitorEngagement } from "../lib/engagement"
import { DEFAULT_VISITOR_ID, errorMessage, listTaverns, type Tavern } from "../lib/taverns"
import { ProductShell } from "../shell/product-shell"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

type ViewerRole = "owner" | "visitor"

type HomeRouteLoaderData = {
  ownerId: string
  viewerId: string
  viewerRole: ViewerRole
}

const HOME_PLACE_CREATE_PATH = "/create?place_type=home"

function cleanIdentity(value: string | null) {
  return typeof value === "string" ? value.trim() : ""
}

function buildHomePlaceHref(ownerId: string) {
  if (!ownerId) return HOME_PLACE_CREATE_PATH
  const params = new URLSearchParams({ place_type: "home" })
  params.set("owner_id", ownerId)
  return `/create?${params.toString()}`
}

type VisitorEngagementRow = {
  tavern: Tavern
  progress: VisitorEngagement
}

function VisitorEngagementSummaryPanel({ viewerId }: { viewerId: string }) {
  const visitorId = viewerId || DEFAULT_VISITOR_ID
  const visitorLabel = viewerId ? visitorId : "旅人"
  const [rows, setRows] = useState<VisitorEngagementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadSummary() {
    setLoading(true)
    setError("")
    try {
      const list = await listTaverns({ limit: 24, offset: 0 })
      const taverns = Array.isArray(list.taverns) ? list.taverns : []
      const results = await Promise.allSettled(
        taverns.map(async (tavern) => ({
          tavern,
          progress: await getVisitorEngagement(tavern.id, visitorId),
        })),
      )
      setRows(
        results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []),
      )
    } catch (err) {
      setError(errorMessage(err))
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSummary()
  }, [visitorId])

  const summary = useMemo(() => rows.reduce(
    (acc, row) => {
      const wallet = row.progress.wallet || { balance: 0, lifetime_earned: 0, lifetime_spent: 0 }
      const balance = Number(wallet.balance || 0)
      const lifetimeEarned = Number(wallet.lifetime_earned || 0)
      const lifetimeSpent = Number(wallet.lifetime_spent || 0)
      const vouchers = Number(row.progress.vouchers_available || 0)
      acc.balance += balance
      acc.lifetimeEarned += lifetimeEarned
      acc.lifetimeSpent += lifetimeSpent
      acc.vouchers += vouchers
      if (balance > 0 || lifetimeEarned > 0 || lifetimeSpent > 0 || vouchers > 0) acc.activeSpaces += 1
      return acc
    },
    { balance: 0, lifetimeEarned: 0, lifetimeSpent: 0, vouchers: 0, activeSpaces: 0 },
  ), [rows])

  const topRows = useMemo(() => [...rows]
    .sort((a, b) => Number(b.progress.wallet?.balance || 0) - Number(a.progress.wallet?.balance || 0))
    .slice(0, 5), [rows])

  return (
    <Card data-visitor-engagement-summary className="border-amber-300/18 bg-amber-300/8">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-300" />
              游客资产汇总
            </CardTitle>
            <CardDescription className="mt-2">
              这里汇总你在不同空间获得的纪念币和礼物券，方便回访时查看。
            </CardDescription>
          </div>
          <Button type="button" variant="secondary" onClick={() => void loadSummary()} disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
            刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-100/72">总余额</p>
            <p className="mt-2 text-3xl font-black text-amber-200">{summary.balance}</p>
            <p className="mt-1 text-xs text-amber-100/64">全部空间汇总</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/22 bg-emerald-400/8 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-100/72">累计获得</p>
            <p className="mt-2 text-3xl font-black text-emerald-200">{summary.lifetimeEarned}</p>
            <p className="mt-1 text-xs text-emerald-100/64">完成玩法 / NPC 赠予</p>
          </div>
          <div className="rounded-2xl border border-violet-400/25 bg-violet-400/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-100/72">礼物券</p>
            <p className="mt-2 text-3xl font-black text-violet-200">{summary.vouchers}</p>
            <p className="mt-1 text-xs text-violet-100/64">全局可见汇总</p>
          </div>
        </div>

        <div className="rounded-2xl border border-theme-border bg-theme-card p-4 text-sm leading-6 text-theme-muted">
          <p className="flex items-center gap-2 font-bold text-theme-primary">
            <Gift className="h-4 w-4 text-amber-300" />
            为什么放在个人中心？
          </p>
          <p className="mt-2">
            这类资产跟随游客身份汇总，用来查看你在不同坐标里的收获、已花费与券数量；具体送礼对象仍会回到对应 NPC / 空间确认。
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-400/25 bg-red-400/8 p-4 text-sm text-red-100">
            资产汇总暂不可用：{error}
          </div>
        ) : null}

        {loading ? (
          <p className="rounded-2xl border border-theme-border bg-theme-card p-4 text-sm text-theme-muted">正在同步游客资产汇总…</p>
        ) : topRows.length ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-theme-muted">
              <span>空间明细</span>
              <span>{summary.activeSpaces} 个有资产记录</span>
            </div>
            {topRows.map(({ tavern, progress }) => (
              <Link
                key={tavern.id}
                to={`/tavern/${encodeURIComponent(tavern.id)}`}
                className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-theme-border bg-theme-card p-3 text-sm transition hover:border-theme-accent-border"
              >
                <span className="min-w-0">
                  <span className="block truncate font-black text-theme-primary">{tavern.name || tavern.id}</span>
                  <span className="mt-0.5 block truncate text-xs text-theme-muted">{progress.coin_label || "纪念币"}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3 text-xs font-bold text-theme-muted">
                  <span className="inline-flex items-center gap-1 text-amber-200">
                    <Coins className="h-3.5 w-3.5" />
                    {Number(progress.wallet?.balance || 0)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-violet-200">
                    <Ticket className="h-3.5 w-3.5" />
                    {Number(progress.vouchers_available || 0)}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-theme-border bg-theme-card p-4 text-sm leading-6 text-theme-muted">
            暂时没有游客资产记录。进入空间并完成店主已发布的玩法后，这里会汇总展示。
          </div>
        )}

        <p className="text-xs leading-5 text-theme-muted">
          当前回访标识：<span className="font-bold text-theme-primary">{visitorLabel}</span>
        </p>
      </CardContent>
    </Card>
  )
}

export async function clientLoader({ request }: ClientLoaderFunctionArgs): Promise<HomeRouteLoaderData> {
  const url = new URL(request.url)
  const ownerId = cleanIdentity(url.searchParams.get("owner_id"))
  const viewerId = cleanIdentity(url.searchParams.get("user_id"))
  const viewerRole: ViewerRole = ownerId && viewerId && ownerId === viewerId ? "owner" : "visitor"

  return { ownerId, viewerId, viewerRole }
}

export default function HomeMePage() {
  const { ownerId, viewerId, viewerRole } = useLoaderData<typeof clientLoader>()
  const homePlaceHref = buildHomePlaceHref(ownerId)
  const ownerHref = ownerId ? `/owner?owner_id=${encodeURIComponent(ownerId)}` : "/owner"
  const isOwnerView = viewerRole === "owner"

  return (
    <ProductShell eyebrow="Home">
      <section
        data-home-route-mode="personal-center"
        className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]"
      >
        <div className="space-y-6">
          <div className="rounded-[2.4rem] border border-lime-300/18 bg-gradient-to-br from-lime-300/12 via-cyan-300/8 to-slate-950/70 p-6 shadow-2xl shadow-black/25 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-3xl border border-lime-200/30 bg-lime-300/12 text-3xl shadow-[0_0_32px_rgba(190,242,100,0.14)]">
                🏠
              </span>
              <span className="rounded-full border border-lime-200/28 bg-lime-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-lime-50">
                个人中心
              </span>
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight text-theme-primary sm:text-5xl">
              你的回访与空间入口
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-theme-muted">
              这里汇总你作为游客的探索资产，也提供创建和管理空间的快捷入口。想聊天时，请从具体空间进入。
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-h-14">
                <Link to={homePlaceHref}>
                  <HomeIcon className="h-5 w-5" />
                  创建自己的空间
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="min-h-14">
                <Link to={ownerHref}>
                  <UserRound className="h-5 w-5" />
                  管理已有空间
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: MapPinned,
                title: "我的坐标",
                text: "想开一间自己的空间时，先选择真实地点，再填写内容。",
              },
              {
                icon: ShieldCheck,
                title: "私密空间",
                text: "家、工作室等私人空间默认只通过分享链接进入。",
              },
              {
                icon: Compass,
                title: "回到探索",
                text: "想继续拜访别人的空间，可以从发现页进入。",
              },
            ].map((item) => (
              <Card key={item.title} className="border-theme-border bg-theme-card">
                <CardHeader>
                  <item.icon className="h-6 w-6 text-lime-100" />
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-theme-muted">{item.text}</CardContent>
              </Card>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <VisitorEngagementSummaryPanel viewerId={viewerId} />

          <Card className="border-theme-accent-border bg-theme-accent-bg">
            <CardHeader>
              <CardTitle>{isOwnerView ? "店主入口" : "继续探索"}</CardTitle>
              <CardDescription>
                {isOwnerView
                  ? "你可以继续创建或管理自己的空间。"
                  : "从这里回到发现页，或使用朋友分享的空间链接进入。"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-theme-muted">
              {isOwnerView ? (
                <>
                  <p>继续完善你的空间，或回到店主管理页查看回访情况。</p>
                  <div className="grid gap-2">
                    <Button asChild variant="secondary" className="min-h-12 justify-start">
                      <Link to={homePlaceHref}>创建自己的空间</Link>
                    </Button>
                    <Button asChild variant="secondary" className="min-h-12 justify-start">
                      <Link to={ownerHref}>进入店主管理</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    如果你是访客，可以从主人分享的链接进入具体空间，也可以在发现页看看公开空间。
                  </p>
                  <Button asChild variant="secondary" className="min-h-12 w-full justify-start">
                    <Link to="/discover">去发现公开空间</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-theme-border bg-theme-card">
            <CardHeader>
              <CardTitle>保持简单</CardTitle>
              <CardDescription>个人中心只做汇总和跳转，具体体验回到对应空间完成。</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm leading-6 text-theme-muted">
                <li>• 聊天请进入具体空间后开始。</li>
                <li>• 反馈只发给店主，不做公开留言墙。</li>
                <li>• 空间内容仍由店主自己确认和发布。</li>
              </ul>
              <div className="mt-5 rounded-2xl border border-theme-border bg-theme-card p-3 text-xs leading-5 text-theme-muted">
                当前身份：{isOwnerView ? "店主" : "访客"} · {(viewerId || ownerId) ? "已识别" : "旅人"}
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </ProductShell>
  )
}

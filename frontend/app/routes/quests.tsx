import type { ClientLoaderFunctionArgs } from "react-router"
import { ArrowRight, CheckCircle2, Compass, MapPinned, ShieldCheck, Sparkles } from "lucide-react"
import { Link, useLoaderData } from "react-router"

import { buildQuestGuideSummary } from "../lib/quest-guide.js"
import { DEFAULT_OWNER_ID, errorMessage, listTaverns, type Tavern } from "../lib/taverns"
import { ProductShell } from "../shell/product-shell"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const url = new URL(request.url)
  const ownerId = url.searchParams.get("owner_id")?.trim() || DEFAULT_OWNER_ID
  const errors: string[] = []
  let taverns: Tavern[] = []

  try {
    const result = await listTaverns({})
    taverns = result.taverns || []
  } catch (error) {
    errors.push(`读取探索清单数据失败：${errorMessage(error)}`)
  }

  return {
    ownerId,
    errors,
    summary: buildQuestGuideSummary({ taverns, ownerId }),
  }
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

export default function QuestsRoute() {
  const { ownerId, errors, summary } = useLoaderData<typeof clientLoader>()

  return (
    <ProductShell eyebrow="Checklist">
      <section id="checklist-mainline" className="scroll-mt-28 grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <aside className="space-y-5">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-black text-cyan-100">
                <Compass className="h-3.5 w-3.5" />
                Explorer checklist
              </div>
              <CardTitle className="text-4xl font-black leading-tight">探索清单</CardTitle>
              <CardDescription className="text-base leading-7">
                这是赛博酒馆的轻量引导，不是传统 RPG 主线、数值成长或竞赛榜单。目标只帮助你找到下一间真实坐标酒馆、认识 NPC、记录完成与回访提示。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Button asChild size="lg">
                  <Link to="/discover">
                    <MapPinned className="h-4 w-4" />
                    从发现页开始
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to={`/create?owner_id=${encodeURIComponent(ownerId)}`}>
                    <Sparkles className="h-4 w-4" />
                    创建自己的酒馆
                  </Link>
                </Button>
              </div>

              <div className="rounded-3xl border border-emerald-300/16 bg-emerald-300/[0.07] p-4">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-100/75">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  边界说明
                </p>
                <p className="mt-2 text-sm leading-7 text-violet-100/72">
                  本 MVP 只根据现有酒馆列表做前端引导与进度估算；不新增持久化清单 Schema，不发放可交易奖励，不展示任何排名。
                </p>
              </div>

              {errors.length ? (
                <div className="space-y-2 rounded-2xl border border-amber-300/28 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
                  {errors.map((item) => <p key={item}>{item}</p>)}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>当前引导状态</CardTitle>
              <CardDescription>进度来自当前可见酒馆数据，不读取访客私密记忆。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                <p className="text-violet-100/55">可见酒馆</p>
                <p className="mt-1 text-2xl font-black text-white">{summary.metrics.taverns}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                <p className="text-violet-100/55">开放入口</p>
                <p className="mt-1 text-2xl font-black text-white">{summary.metrics.openTaverns}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                <p className="text-violet-100/55">可认识 NPC</p>
                <p className="mt-1 text-2xl font-black text-white">{summary.metrics.npcCount}</p>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/62">已满足</p>
              <p className="mt-3 text-3xl font-black text-white">{summary.completedCount}</p>
              <p className="mt-2 text-sm text-violet-100/58">达到当前数据条件的清单项目</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-100/62">待探索</p>
              <p className="mt-3 text-3xl font-black text-white">{summary.activeCount}</p>
              <p className="mt-2 text-sm text-violet-100/58">可继续推进的安全目标</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100/62">玩法酒馆</p>
              <p className="mt-3 text-3xl font-black text-white">{summary.metrics.questPlayTaverns}</p>
              <p className="mt-2 text-sm text-violet-100/58">含探索布局或已发布玩法</p>
            </Card>
          </div>

          <section className="grid gap-4">
            {summary.quests.map((quest) => (
              <Card key={quest.id} className="overflow-hidden p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-lg" aria-hidden="true">
                        {quest.icon}
                      </span>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/62">{quest.typeLabel}</p>
                        <h2 className="text-xl font-black text-white">{quest.title}</h2>
                      </div>
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-violet-100/66">{quest.description}</p>
                  </div>

                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-black text-violet-50">
                    {quest.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" /> : null}
                    {quest.statusLabel}
                  </span>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between gap-3 text-xs font-bold text-violet-100/58">
                    <span>{quest.rawCurrent} / {quest.target}</span>
                    <span>{formatPercent(quest.progress)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10" aria-label={`${quest.title} 进度 ${formatPercent(quest.progress)}`}>
                    <div className="h-full rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(0,214,201,0.32)]" style={{ width: formatPercent(quest.progress) }} />
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-violet-100/58">{quest.rewardText}</p>
                  <Button asChild size="sm" variant="ghost">
                    <Link to={quest.ctaTo}>
                      {quest.ctaLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </section>
        </div>
      </section>
    </ProductShell>
  )
}

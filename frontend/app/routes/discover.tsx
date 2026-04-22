import { Compass, MapPinned, RadioTower, Store } from "lucide-react"
import { Link, useLoaderData } from "react-router"

import { errorMessage, listTaverns, type TavernListResponse } from "../lib/taverns"
import { ProductShell } from "../shell/product-shell"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

type DiscoverLoaderData = {
  result: TavernListResponse
  error: string
}

export async function clientLoader(): Promise<DiscoverLoaderData> {
  try {
    return { result: await listTaverns(), error: "" }
  } catch (error) {
    return { result: { taverns: [], count: 0 }, error: errorMessage(error) }
  }
}

export default function DiscoverRoute() {
  const { result, error } = useLoaderData<typeof clientLoader>()

  return (
    <ProductShell eyebrow="Discover">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>地图发现层</CardTitle>
            <CardDescription>
              新 Route Module 已接入 `/api/v1/taverns`，用于真实地点上的酒馆发现。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/8 p-5">
              <MapPinned className="mb-4 h-7 w-7 text-cyan-200" />
              <p className="leading-7">当前发现入口使用新前端服务层读取原生 v1 API，不再通过旧入口渲染。</p>
            </div>
            <Button asChild variant="secondary">
              <Link to="/create">没有看到喜欢的？开一间</Link>
            </Button>
            {error ? (
              <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
                API 暂不可用：{error}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-white/12 bg-slate-950/60 p-6 shadow-2xl shadow-black/25">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,214,201,0.22),transparent_18rem),radial-gradient(circle_at_70%_70%,rgba(154,124,255,0.22),transparent_20rem)]" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-3xl font-black text-white">Real Map Surface</h2>
                <p className="text-sm text-violet-100/60">{result.count} 间酒馆已接入发现流。</p>
              </div>
              <Compass className="h-10 w-10 text-cyan-200" />
            </div>
            <div className="grid gap-3">
              {result.taverns.length ? (
                result.taverns.map((tavern) => (
                  <Link
                    key={tavern.id}
                    to={`/tavern/${encodeURIComponent(tavern.id)}`}
                    className="group rounded-3xl border border-white/12 bg-slate-950/70 p-4 transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-300/15 text-cyan-100">
                        <Store className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white group-hover:text-cyan-100">{tavern.name}</h3>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-violet-100/65">
                          {tavern.description || "店主还没有写下酒馆简介。"}
                        </p>
                        <p className="mt-2 text-xs text-violet-100/45">
                          {Number(tavern.lat).toFixed(4)}, {Number(tavern.lon).toFixed(4)} · {tavern.status || "unknown"} ·{" "}
                          {tavern.access || "public"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="grid min-h-64 place-items-center rounded-3xl border border-white/12 bg-white/6 text-center">
                  <div className="space-y-3">
                    <RadioTower className="mx-auto h-9 w-9 text-violet-100/60" />
                    <p className="text-violet-100/70">还没有可展示的酒馆，先创建一个真实坐标锚点。</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </ProductShell>
  )
}

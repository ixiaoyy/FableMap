import type { ClientLoaderFunctionArgs } from "react-router"
import { MessageSquareText, ScrollText, Send, UsersRound } from "lucide-react"
import { useState, type FormEvent } from "react"
import { useLoaderData } from "react-router"

import {
  DEFAULT_VISITOR_ID,
  enterTavern,
  errorMessage,
  getTavern,
  sendTavernChat,
  type ChatMessage,
  type Tavern,
  type TavernCharacter,
} from "../lib/taverns"
import { ProductShell } from "../shell/product-shell"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

type TavernLoaderData = {
  tavernId: string
  tavern: Tavern | null
  error: string
}

export async function clientLoader({ params }: ClientLoaderFunctionArgs): Promise<TavernLoaderData> {
  const tavernId = params.tavernId ?? ""
  if (!tavernId) {
    return { tavernId, tavern: null, error: "缺少酒馆 ID" }
  }
  try {
    return { tavernId, tavern: await getTavern(tavernId, DEFAULT_VISITOR_ID), error: "" }
  } catch (error) {
    return { tavernId, tavern: null, error: errorMessage(error) }
  }
}

export default function TavernRoute() {
  const { tavernId, tavern, error } = useLoaderData<typeof clientLoader>()
  const characters = tavern?.characters || []

  return (
    <ProductShell eyebrow="Tavern">
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>{tavern?.name || "酒馆入口"}</CardTitle>
            <CardDescription>{tavern?.description || `目标酒馆 ID：${tavernId || "未指定"}`}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-violet-100/72">
            {error ? (
              <p className="rounded-2xl border border-red-300/30 bg-red-300/10 p-3 text-red-100">加载失败：{error}</p>
            ) : null}
            {tavern ? (
              <>
                <p>{tavern.scene_prompt || "店主还没有写下场景提示。"}</p>
                <div className="grid gap-2 rounded-3xl border border-white/10 bg-white/6 p-4">
                  <span>坐标：{Number(tavern.lat).toFixed(5)}, {Number(tavern.lon).toFixed(5)}</span>
                  <span>状态：{tavern.status || "unknown"} · 访问：{tavern.access || "public"}</span>
                  <span>回访次数：{tavern.visit_count ?? 0}</span>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: UsersRound, title: "角色", text: "SillyTavern 兼容 NPC 卡" },
            { icon: MessageSquareText, title: "对话", text: "AI 驱动的酒馆互动" },
            { icon: ScrollText, title: "记忆", text: "对话写回与回访反馈" },
          ].map((item) => (
            <Card key={item.title} className="min-h-48">
              <item.icon className="mb-5 h-7 w-7 text-cyan-200" />
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription className="mt-3">{item.text}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      {tavern ? (
        <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardHeader>
              <CardTitle>NPC 角色</CardTitle>
              <CardDescription>SillyTavern 兼容角色卡会作为酒馆体验入口。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {characters.length ? (
                characters.map((character) => (
                  <div key={character.id} className="rounded-3xl border border-white/10 bg-white/6 p-4">
                    <h3 className="font-bold text-white">{character.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-violet-100/65">{character.description || "暂无角色简介。"}</p>
                    {character.first_mes ? <p className="mt-2 text-xs text-cyan-100/70">“{character.first_mes}”</p> : null}
                  </div>
                ))
              ) : (
                <p className="rounded-3xl border border-white/10 bg-white/6 p-4 text-sm text-violet-100/65">
                  这间酒馆还没有 NPC。请用“开店”页创建时添加首个角色，或后续接入店主编辑器。
                </p>
              )}
            </CardContent>
          </Card>

          <TavernChat tavern={tavern} character={characters[0]} />
        </section>
      ) : null}
    </ProductShell>
  )
}

function TavernChat({ tavern, character }: { tavern: Tavern; character?: TavernCharacter }) {
  const [visitorId, setVisitorId] = useState(DEFAULT_VISITOR_ID)
  const [visitorName, setVisitorName] = useState("测试旅人")
  const [message, setMessage] = useState("")
  const [lines, setLines] = useState<ChatMessage[]>([])
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")

  async function handleEnter() {
    setBusy(true)
    setError("")
    setNotice("")
    try {
      const result = await enterTavern(tavern.id, "", visitorId)
      setNotice(result.first_mes || "已进入酒馆。")
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!character || !message.trim()) {
      return
    }
    const userLine: ChatMessage = { role: "user", content: message.trim(), visitor_id: visitorId }
    setLines((current) => [...current, userLine])
    setMessage("")
    setBusy(true)
    setError("")
    try {
      const result = await sendTavernChat(tavern.id, {
        character_id: character.id,
        visitor_id: visitorId,
        visitor_name: visitorName,
        message: userLine.content,
      })
      setLines((current) => [...current, { role: "assistant", content: result.response, character_id: character.id }])
      if (result.degradation?.message) {
        setNotice(result.degradation.message)
      }
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>进入并对话</CardTitle>
        <CardDescription>
          当前体验通过 `/api/v1/taverns/{tavern.id}/enter` 和 `/chat` 写入真实会话记录。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-violet-100/65">访客 ID</span>
            <input
              value={visitorId}
              onChange={(event) => setVisitorId(event.target.value)}
              className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-violet-100/65">显示名</span>
            <input
              value={visitorName}
              onChange={(event) => setVisitorName(event.target.value)}
              className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
            />
          </label>
        </div>
        <Button type="button" variant="secondary" disabled={busy} onClick={handleEnter}>
          进入酒馆
        </Button>
        <div className="min-h-52 space-y-3 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
          {lines.length ? (
            lines.map((line, index) => (
              <div
                key={`${line.role}-${index}`}
                className={
                  line.role === "user"
                    ? "ml-auto max-w-[82%] rounded-3xl bg-cyan-300/16 p-3 text-sm text-cyan-50"
                    : "max-w-[82%] rounded-3xl bg-white/8 p-3 text-sm text-violet-50"
                }
              >
                {line.content}
              </div>
            ))
          ) : (
            <p className="text-sm text-violet-100/55">
              {character ? `向 ${character.name} 说第一句话。` : "暂无可对话 NPC。"}
            </p>
          )}
        </div>
        {notice ? <p className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-3 text-sm text-cyan-100">{notice}</p> : null}
        {error ? <p className="rounded-2xl border border-red-300/30 bg-red-300/10 p-3 text-sm text-red-100">{error}</p> : null}
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={!character || busy}
            placeholder={character ? "今晚有什么推荐？" : "先添加 NPC"}
            className="min-h-12 flex-1 rounded-full border border-white/12 bg-white/8 px-5 text-white outline-none focus:border-cyan-300/60"
          />
          <Button type="submit" disabled={!character || busy || !message.trim()}>
            <Send className="h-4 w-4" />
            发送
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

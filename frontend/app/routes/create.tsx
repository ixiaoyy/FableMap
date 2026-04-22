import { KeyRound, MapPinned, UserRoundPlus } from "lucide-react"
import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router"

import { addCharacter, createTavern, DEFAULT_OWNER_ID, errorMessage } from "../lib/taverns"
import { ProductShell } from "../shell/product-shell"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"

const steps = [
  { icon: MapPinned, title: "选择真实坐标", text: "酒馆必须挂接真实地图位置，地点是空间锚点。" },
  { icon: UserRoundPlus, title: "配置 AI NPC", text: "导入或手写 SillyTavern 兼容角色卡。" },
  { icon: KeyRound, title: "店主 LLM 配置", text: "API Key 与 token 由店主承担，前端不暴露给访客。" },
]

export default function CreateRoute() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [createdId, setCreatedId] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const ownerId = String(form.get("owner_id") || DEFAULT_OWNER_ID).trim() || DEFAULT_OWNER_ID
    const characterName = String(form.get("character_name") || "").trim()
    setBusy(true)
    setError("")
    setCreatedId("")
    try {
      const created = await createTavern(
        {
          name: String(form.get("name") || "").trim() || "未命名酒馆",
          description: String(form.get("description") || "").trim(),
          lat: Number(form.get("lat") || 0),
          lon: Number(form.get("lon") || 0),
          address: String(form.get("address") || "").trim(),
          access: String(form.get("access") || "public"),
          scene_prompt: String(form.get("scene_prompt") || "").trim(),
          llm_config: { backend: "rules", model: "rules" },
        },
        ownerId,
      )
      if (characterName) {
        await addCharacter(
          created.id,
          {
            name: characterName,
            description: String(form.get("character_description") || "").trim(),
            first_mes: String(form.get("first_mes") || "").trim() || "欢迎光临。",
          },
          ownerId,
        )
      }
      setCreatedId(created.id)
      navigate(`/tavern/${encodeURIComponent(created.id)}`)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <ProductShell eyebrow="Create">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>店主创作工具</CardTitle>
            <CardDescription>
              这里是产品内创作者工作流，不是后台管理台。当前表单已接入 `/api/v1/taverns`。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="text-violet-100/65">店主 ID</span>
                  <input
                    name="owner_id"
                    defaultValue={DEFAULT_OWNER_ID}
                    className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-violet-100/65">访问方式</span>
                  <select
                    name="access"
                    defaultValue="public"
                    className="w-full rounded-2xl border border-white/12 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                  >
                    <option value="public">public</option>
                    <option value="private">private</option>
                    <option value="password">password</option>
                  </select>
                </label>
              </div>

              <label className="space-y-1 text-sm">
                <span className="text-violet-100/65">酒馆名称</span>
                <input
                  name="name"
                  required
                  placeholder="星港夜谈"
                  className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-violet-100/65">简介</span>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="写下店主确认的酒馆氛围。"
                  className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-1 text-sm">
                  <span className="text-violet-100/65">纬度</span>
                  <input
                    name="lat"
                    required
                    type="number"
                    step="0.000001"
                    defaultValue="31.2304"
                    className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-violet-100/65">经度</span>
                  <input
                    name="lon"
                    required
                    type="number"
                    step="0.000001"
                    defaultValue="121.4737"
                    className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-violet-100/65">地址标签</span>
                  <input
                    name="address"
                    placeholder="上海 · 外滩"
                    className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                  />
                </label>
              </div>
              <label className="space-y-1 text-sm">
                <span className="text-violet-100/65">场景提示</span>
                <textarea
                  name="scene_prompt"
                  rows={3}
                  placeholder="这个空间闻起来像雨后的霓虹和热红酒。"
                  className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="text-violet-100/65">首个 NPC</span>
                  <input
                    name="character_name"
                    placeholder="阿珀"
                    className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-violet-100/65">NPC 简介</span>
                  <input
                    name="character_description"
                    placeholder="记得每位回访者点过的酒"
                    className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                  />
                </label>
              </div>
              <label className="space-y-1 text-sm">
                <span className="text-violet-100/65">首次问候</span>
                <input
                  name="first_mes"
                  placeholder="欢迎回到这里。"
                  className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                />
              </label>
              {error ? <p className="rounded-2xl border border-red-300/30 bg-red-300/10 p-3 text-sm text-red-100">{error}</p> : null}
              {createdId ? <p className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-3 text-sm text-cyan-100">已创建：{createdId}</p> : null}
              <Button type="submit" disabled={busy}>
                {busy ? "正在开店..." : "创建酒馆"}
              </Button>
            </form>

            {steps.map((step) => (
              <div key={step.title} className="flex gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                <step.icon className="mt-1 h-6 w-6 shrink-0 text-cyan-200" />
                <div>
                  <h3 className="font-bold text-white">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-violet-100/65">{step.text}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-400/16 to-cyan-300/8">
          <CardHeader>
            <CardTitle>开店检查</CardTitle>
            <CardDescription>先建立边界，再接入数据保存。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-3 text-sm text-violet-100/72">
              <li>✓ 真实坐标</li>
              <li>✓ 店主确认的酒馆内容</li>
              <li>✓ 角色卡可导出</li>
              <li>✓ API Key 不向访客暴露</li>
            </ul>
            <Dialog>
              <DialogTrigger asChild>
                <Button>查看开店说明</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>FableMap 创作者工具</DialogTitle>
                  <DialogDescription>
                    后续表单会以 owner-authored 内容为中心：平台提供结构和体验，不替店主自动生成酒馆内容。
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </section>
    </ProductShell>
  )
}

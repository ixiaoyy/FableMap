import { ArrowRight, CheckCircle2, KeyRound, MapPinned, ShieldCheck, Sparkles, UserRoundPlus, Wand2 } from "lucide-react"
import { useState, useEffect, type FormEvent } from "react"
import { useNavigate, useSearchParams } from "react-router"

import tavernStreetImage from "../assets/homepage/reference/modules/tavern-street.png"
import merchantPortrait from "../assets/npc-style-cast/portraits/merchant-a.png"
import { readCreatePrefill } from "../lib/creator-conversion.js"
import { normalizeCreatePlacePayload } from "../lib/place-home.js"
import { derivePlaceTypeDisplay, PLACE_TYPES } from "../lib/place-types.js"
import { createTavernDraftRequest, draftResponseToCreateForm } from "../lib/tavern-drafts.js"
import {
  addCharacter,
  createTavern,
  DEFAULT_OWNER_ID,
  errorMessage,
  generateTavernDraft,
  getOwnerDefaultLLM,
  saveOwnerDefaultLLM,
  type TavernDraft,
} from "../lib/taverns"
import { ProductShell } from "../shell/product-shell"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import LLMConfigForm from "../product/LLMConfigForm.jsx"

const steps = [
  { icon: MapPinned, title: "选择真实坐标", text: "酒馆必须挂接真实地图位置，地点是空间锚点。" },
  { icon: UserRoundPlus, title: "配置 AI NPC", text: "导入或手写 SillyTavern 兼容角色卡。" },
  { icon: KeyRound, title: "店主 LLM 配置", text: "API Key 与 token 由店主承担，前端不暴露给访客。" },
]

const checklist = ["真实坐标", "店主确认的酒馆内容", "角色卡可导出", "API Key 不向访客暴露"]

export default function CreateRoute() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createPrefill = readCreatePrefill(searchParams)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [createdId, setCreatedId] = useState("")
  const [placeType, setPlaceType] = useState("tavern")
  const activePlaceType = derivePlaceTypeDisplay(placeType)

  // AI Draft states
  const [llmConfigured, setLlmConfigured] = useState<boolean | null>(null)
  const [generating, setGenerating] = useState(false)
  const [draftError, setDraftError] = useState("")
  const [draftSuccess, setDraftSuccess] = useState(false)
  const [showLLMConfig, setShowLLMConfig] = useState(false)
  const [ownerId, setOwnerId] = useState(DEFAULT_OWNER_ID)
  const [llmConfigDraft, setLlmConfigDraft] = useState<Record<string, unknown>>({})

  // Style tags for draft generation
  const styleTags = ["cyberpunk", "fantasy", "scifi", "slice-of-life", "romance", "mystery", "adventure"]
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [forbiddenText, setForbiddenText] = useState("")
  const [tone, setTone] = useState("角色扮演")

  // Check LLM config status on mount
  useEffect(() => {
    checkLLMConfig(ownerId)
  }, [ownerId])

  async function checkLLMConfig(userId = ownerId) {
    try {
      const result = await getOwnerDefaultLLM(userId)
      setLlmConfigured(result.configured)
    } catch {
      setLlmConfigured(false)
    }
  }

  async function handleSaveLLMConfig(config: Record<string, unknown>) {
    try {
      await saveOwnerDefaultLLM(
        {
          backend: config.backend as string,
          model: config.model as string,
          api_key: config.api_key as string,
          base_url: config.base_url as string,
          temperature: config.temperature as number,
          max_tokens: config.max_tokens as number,
          top_p: config.top_p as number,
        },
        ownerId,
      )
      setLlmConfigured(true)
      setShowLLMConfig(false)
    } catch (err) {
      setDraftError(errorMessage(err))
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  async function handleGenerateDraft() {
    const latInput = document.querySelector('input[name="lat"]') as HTMLInputElement
    const lonInput = document.querySelector('input[name="lon"]') as HTMLInputElement
    const addressInput = document.querySelector('input[name="address"]') as HTMLInputElement

    const lat = parseFloat(latInput?.value || "0")
    const lon = parseFloat(lonInput?.value || "0")

    if (!lat || !lon) {
      setDraftError("请先填写经纬度坐标")
      return
    }

    setGenerating(true)
    setDraftError("")
    setDraftSuccess(false)

    try {
      const request = createTavernDraftRequest({
        lat,
        lon,
        address: addressInput?.value || undefined,
        placeType,
        styleTagsText: selectedTags.join(","),
        forbiddenText,
        tone,
      })

      const result = await generateTavernDraft(request, ownerId)
      applyDraft(result.draft)
      setDraftSuccess(true)
    } catch (err) {
      setDraftError(errorMessage(err))
    } finally {
      setGenerating(false)
    }
  }

  function applyDraft(draft: TavernDraft) {
    const mapped = draftResponseToCreateForm({ draft })
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement
    const descInput = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement
    const sceneInput = document.querySelector('textarea[name="scene_prompt"]') as HTMLTextAreaElement
    const charNameInput = document.querySelector('input[name="character_name"]') as HTMLInputElement
    const charDescInput = document.querySelector('input[name="character_description"]') as HTMLInputElement
    const firstMesInput = document.querySelector('input[name="first_mes"]') as HTMLInputElement

    if (nameInput) nameInput.value = mapped.name
    if (descInput) descInput.value = mapped.description
    if (sceneInput) sceneInput.value = mapped.scene_prompt
    if (charNameInput) charNameInput.value = mapped.character_name
    if (charDescInput) charDescInput.value = mapped.character_description
    if (firstMesInput) firstMesInput.value = mapped.first_mes
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const ownerIdSubmit = String(form.get("owner_id") || ownerId).trim() || ownerId
    const characterName = String(form.get("character_name") || "").trim()
    setBusy(true)
    setError("")
    setCreatedId("")
    try {
      const created = await createTavern(
        normalizeCreatePlacePayload({
          name: String(form.get("name") || "").trim() || "未命名酒馆",
          description: String(form.get("description") || "").trim(),
          lat: Number(form.get("lat") || 0),
          lon: Number(form.get("lon") || 0),
          address: String(form.get("address") || "").trim(),
          access: String(form.get("access") || "public"),
          place_type: String(form.get("place_type") || "tavern"),
          roleplay_mode: String(form.get("roleplay_mode") || "ai_only"),
          scene_prompt: String(form.get("scene_prompt") || "").trim(),
          llm_config: { backend: "rules", model: "rules" },
        }),
        ownerIdSubmit,
      )
      if (characterName) {
        await addCharacter(
          created.id,
          {
            name: characterName,
            description: String(form.get("character_description") || "").trim(),
            first_mes: String(form.get("first_mes") || "").trim() || "欢迎光临。",
          },
          ownerIdSubmit,
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
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="rounded-[2.2rem] border border-white/12 bg-slate-950/72 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
          <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/70">Tavernkeeper console</p>
              <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">开一间真实坐标上的酒馆</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-violet-100/62">
                表单只保存店主确认的内容：名称、场景、坐标、访问方式和首个 NPC。平台提供结构，不替店主创作故事。
              </p>
              {createPrefill.hasSource ? (
                <p className="mt-3 max-w-2xl rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm leading-6 text-cyan-50">
                  已从酒馆 {createPrefill.sourceTavernId} 带入真实坐标/地址；不会复制原酒馆名称、简介、角色或场景内容。
                </p>
              ) : null}
            </div>
            <span className="grid h-14 w-14 place-items-center rounded-full border border-cyan-300/28 bg-cyan-300/10 text-cyan-100">
              <MapPinned className="h-7 w-7" />
            </span>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1.5 text-sm">
                <span className="text-violet-100/65">店主 ID</span>
                <input
                  name="owner_id"
                  value={ownerId}
                  onChange={(event) => setOwnerId(event.target.value)}
                  className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-violet-100/65">访问方式</span>
                <select name="access" defaultValue={placeType === "home" ? "private" : "public"} className="w-full rounded-2xl border border-white/12 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300/60">
                  <option value="public">public</option>
                  <option value="private">private</option>
                  <option value="password">password</option>
                </select>
                {placeType === "home" ? (
                  <span className="block text-xs leading-5 text-amber-100/70">Home 会按受控空间保存；public 会自动收敛为 private。</span>
                ) : null}
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-violet-100/65">Roleplay</span>
                <select name="roleplay_mode" defaultValue="ai_only" className="w-full rounded-2xl border border-white/12 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300/60">
                  <option value="ai_only">ai_only</option>
                  <option value="hybrid">hybrid</option>
                </select>
              </label>
            </div>

            <section className="space-y-3 rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-4">
              <input type="hidden" name="place_type" value={placeType} />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-black text-white">地点类型</p>
                  <p className="mt-1 text-xs leading-5 text-violet-100/50">
                    先选择这个真实坐标的“空间语气”，后续名称、场景和 NPC 仍由店主确认。
                  </p>
                </div>
                <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${activePlaceType.cardClass || "border-cyan-300/24 bg-cyan-300/10 text-cyan-50"}`}>
                  <span aria-hidden="true">{activePlaceType.icon}</span>
                  {activePlaceType.label}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {PLACE_TYPES.map((type: { id: string; label: string; icon?: string; tone?: string; description?: string; cardClass?: string; reserved?: boolean }) => {
                  const active = placeType === type.id
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setPlaceType(type.id)}
                      className={`min-h-24 touch-manipulation rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${
                        active
                          ? `${type.cardClass || "border-cyan-300/26 bg-cyan-300/10 text-cyan-50"} shadow-[0_0_28px_rgba(0,214,201,0.12)]`
                          : "border-white/10 bg-slate-950/45 text-violet-100/64 hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                      aria-pressed={active}
                    >
                      <span className="text-2xl" aria-hidden="true">{type.icon}</span>
                      <span className="mt-2 block text-sm font-black text-white">{type.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-violet-100/54">{type.tone || type.description}</span>
                      {type.reserved ? (
                        <span className="mt-2 inline-flex rounded-full border border-amber-300/24 bg-amber-300/10 px-2 py-0.5 text-[0.65rem] font-bold text-amber-100">
                          默认私密
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
              <p className="rounded-2xl border border-white/10 bg-slate-950/45 p-3 text-xs leading-5 text-violet-100/56">
                当前选择：<span className="font-bold text-white">{activePlaceType.label}</span> · {activePlaceType.description}
              </p>
            </section>

            <label className="space-y-1.5 text-sm">
              <span className="text-violet-100/65">酒馆名称</span>
              <input name="name" required placeholder="星港夜谈" className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="text-violet-100/65">简介</span>
              <textarea name="description" rows={3} placeholder="写下店主确认的酒馆氛围。" className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1.5 text-sm">
                <span className="text-violet-100/65">纬度</span>
                <input name="lat" required type="number" step="0.000001" defaultValue={createPrefill.lat} className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-violet-100/65">经度</span>
                <input name="lon" required type="number" step="0.000001" defaultValue={createPrefill.lon} className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-violet-100/65">地址标签</span>
                <input name="address" defaultValue={createPrefill.address} placeholder="上海 · 外滩" className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
              </label>
            </div>
            <label className="space-y-1.5 text-sm">
              <span className="text-violet-100/65">场景提示</span>
              <textarea name="scene_prompt" rows={3} placeholder="这个空间闻起来像雨后的霓虹和热红酒。" className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm">
                <span className="text-violet-100/65">首个 NPC</span>
                <input name="character_name" placeholder="阿珀" className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-violet-100/65">NPC 简介</span>
                <input name="character_description" placeholder="记得每位回访者点过的酒" className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
              </label>
            </div>
            <label className="space-y-1.5 text-sm">
              <span className="text-violet-100/65">首次问候</span>
              <input name="first_mes" placeholder="欢迎回到这里。" className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60" />
            </label>
            {error ? <p className="rounded-2xl border border-red-300/30 bg-red-300/10 p-3 text-sm text-red-100">{error}</p> : null}
            {createdId ? <p className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-3 text-sm text-cyan-100">已创建：{createdId}</p> : null}
            <Button type="submit" disabled={busy} size="lg">
              {busy ? "正在开店..." : "创建酒馆"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <aside className="space-y-5">
          {/* AI Draft Panel */}
          <div className="rounded-[2rem] border border-purple-300/20 bg-gradient-to-br from-purple-950/60 to-slate-950/72 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-300/30 bg-purple-300/10">
                <Sparkles className="h-5 w-5 text-purple-200" />
              </div>
              <div>
                <h2 className="font-black text-white">AI 辅助草稿</h2>
                <p className="text-xs text-violet-100/60">用 AI 生成酒馆创意</p>
              </div>
            </div>

            {llmConfigured === null ? (
              <div className="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <span className="text-sm text-violet-100/50">检查 AI 配置...</span>
              </div>
            ) : !llmConfigured ? (
              <div className="space-y-3">
                <p className="text-sm text-violet-100/70">
                  需要先配置默认 AI 服务，才能使用草稿生成功能。
                </p>
                <Dialog open={showLLMConfig} onOpenChange={setShowLLMConfig}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="w-full">
                      <KeyRound className="mr-2 h-4 w-4" />
                      配置默认 AI
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>配置默认 AI 服务</DialogTitle>
                      <DialogDescription>
                        设置用于生成酒馆草稿的默认 AI。API Key 仅你可见，不会被其他用户看到。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      <LLMConfigForm
                        value={llmConfigDraft}
                        onChange={setLlmConfigDraft}
                        compact={false}
                        testDirect={async (config) => {
                          await handleSaveLLMConfig(config)
                          return { ok: true, message: "配置已保存" }
                        }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Style tags */}
                <div>
                  <p className="mb-2 text-xs font-medium text-violet-100/60">风格标签</p>
                  <div className="flex flex-wrap gap-2">
                    {styleTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          selectedTags.includes(tag)
                            ? "border-purple-300/60 bg-purple-300/20 text-purple-100"
                            : "border-white/10 bg-white/[0.04] text-violet-100/60 hover:border-white/20"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-violet-100/60">禁止方向</p>
                  <input
                    value={forbiddenText}
                    onChange={(event) => setForbiddenText(event.target.value)}
                    placeholder="例如：战斗, 等级, 现实名人"
                    className="w-full rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:border-purple-300/60"
                  />
                </div>

                {/* Tone selector */}
                <div>
                  <p className="mb-2 text-xs font-medium text-violet-100/60">基调</p>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:border-purple-300/60"
                  >
                    <option value="角色扮演">角色扮演</option>
                    <option value="轻松日常">轻松日常</option>
                    <option value="悬疑剧情">悬疑剧情</option>
                    <option value="浪漫温馨">浪漫温馨</option>
                    <option value="冒险探索">冒险探索</option>
                  </select>
                </div>

                {/* Generate button */}
                <Button
                  onClick={handleGenerateDraft}
                  disabled={generating}
                  className="w-full"
                  variant="secondary"
                >
                  {generating ? (
                    <>
                      <span className="mr-2 animate-pulse">生成中...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      生成 AI 草稿
                    </>
                  )}
                </Button>

                {draftError && (
                  <p className="rounded-xl border border-red-300/20 bg-red-300/10 p-3 text-xs text-red-100">
                    {draftError}
                  </p>
                )}

                {draftSuccess && (
                  <p className="rounded-xl border border-green-300/20 bg-green-300/10 p-3 text-xs text-green-100">
                    草稿已生成并填入表单，你可以继续编辑后创建酒馆。
                  </p>
                )}

                <p className="text-xs text-violet-100/40">
                  草稿只填充表单，不自动创建酒馆。确认后再点击「创建酒馆」。
                </p>
              </div>
            )}
          </div>

          <div className="relative overflow-hidden rounded-[2.2rem] border border-cyan-300/18 bg-slate-950/72 shadow-2xl shadow-black/30">
            <img src={tavernStreetImage} alt="赛博酒馆街景" className="h-72 w-full object-cover" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050615] via-[#050615]/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-slate-950/66 p-4 backdrop-blur-md">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/70">Owner authored</p>
              <p className="mt-2 text-sm leading-6 text-violet-100/72">内容来自店主，不来自平台自动生成。</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/12 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <img src={merchantPortrait} alt="NPC 形象示例" className="h-16 w-16 rounded-2xl border border-white/12 object-cover" loading="lazy" decoding="async" />
              <div>
                <h2 className="font-black text-white">首个 NPC</h2>
                <p className="mt-1 text-sm text-violet-100/58">可先填写最小角色信息，后续再导入完整角色卡。</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/12 bg-white/[0.04] p-5 backdrop-blur-xl">
            <h2 className="text-xl font-black text-white">开店检查</h2>
            <ul className="mt-4 space-y-3 text-sm text-violet-100/72">
              {checklist.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-cyan-200" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-5 grid gap-3">
              {steps.map((step) => (
                <div key={step.title} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <step.icon className="mt-1 h-5 w-5 shrink-0 text-cyan-200" />
                  <div>
                    <h3 className="font-bold text-white">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-violet-100/60">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-5" variant="secondary">
                  <ShieldCheck className="h-4 w-4" />
                  查看开店说明
                </Button>
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
          </div>
        </aside>
      </section>
    </ProductShell>
  )
}


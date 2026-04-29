/**
 * Home Route - Personal Home Page
 *
 * Shows user's personal Home, visitors can tour and interact with members
 */

import type { ClientActionFunctionArgs, ClientLoaderFunctionArgs } from "react-router"
import {
  ArrowLeft,
  Eye,
  Globe,
  Home as HomeIcon,
  Lock,
  MessageCircle,
  Plus,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react"
import { useLoaderData, useNavigate, Form, Link } from "react-router"
import { useState, type FormEvent } from "react"

import {
  DEFAULT_OWNER_ID,
  errorMessage,
  type Home,
  type HomeMember,
  getMyHome,
  createHome,
  updateHome,
  visitHome,
  chatWithHomeMember,
  leaveHomeMessage,
} from "../lib/taverns"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"

type HomeLoaderData = {
  home: Home | null
  ownerId: string
  visitResult?: {
    can_enter: boolean
    name: string
    message: string | null
  }
  error?: string
}

export async function clientLoader({ request }: ClientLoaderFunctionArgs): Promise<HomeLoaderData> {
  const url = new URL(request.url)
  const ownerId = url.searchParams.get("owner_id")?.trim() || DEFAULT_OWNER_ID
  const action = url.searchParams.get("action")
  const homeId = url.searchParams.get("home_id")

  try {
    const home = await getMyHome(ownerId)
    let visitResult: HomeLoaderData["visitResult"]

    // 如果有 action=visit，说明是访客访问
    if (action === "visit" && homeId) {
      try {
        const result = await visitHome(homeId, ownerId)
        visitResult = {
          can_enter: result.can_enter,
          name: result.name,
          message: result.message,
        }
      } catch {
        visitResult = {
          can_enter: false,
          name: "未知",
          message: "无法访问该 Home",
        }
      }
    }

    return { home, ownerId, visitResult }
  } catch (error) {
    return {
      home: null,
      ownerId,
      error: errorMessage(error),
    }
  }
}

export async function clientAction({ request }: ClientActionFunctionArgs) {
  const formData = await request.formData()
  const intent = formData.get("intent") as string
  const ownerId = (formData.get("owner_id") as string) || DEFAULT_OWNER_ID

  try {
    if (intent === "create") {
      const home = await createHome(
        {
          name: (formData.get("name") as string) || `${ownerId}的小窝`,
          description: (formData.get("description") as string) || "",
          theme: (formData.get("theme") as string) || "cozy",
          visit_settings: {
            public: formData.get("public") === "true",
            approval_required: false,
            friends_only: false,
            max_daily_visitors: 50,
          },
        },
        ownerId,
      )
      return { success: true, home }
    }

    if (intent === "update") {
      const homeId = formData.get("home_id") as string
      const home = await updateHome(
        homeId,
        {
          name: (formData.get("name") as string) || undefined,
          description: (formData.get("description") as string) || undefined,
          theme: (formData.get("theme") as string) || undefined,
          status: (formData.get("status") as string) || undefined,
        },
        ownerId,
      )
      return { success: true, home }
    }

    if (intent === "leave_message") {
      const homeId = formData.get("home_id") as string
      const content = (formData.get("message") as string) || ""
      const visitorNickname = (formData.get("visitor_nickname") as string) || "旅人"
      await leaveHomeMessage(homeId, content, visitorNickname, ownerId)
      return { success: true }
    }

    return { success: false, error: "Unknown action" }
  } catch (error) {
    return { success: false, error: errorMessage(error) }
  }
}

// ── UI Components ────────────────────────────────

function HomeStatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: typeof Globe; label: string; className: string }> = {
    open: { icon: Globe, label: "开放", className: "bg-green-500/20 text-green-400 border-green-500/30" },
    closed: { icon: Lock, label: "关闭", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    hidden: { icon: Shield, label: "隐藏", className: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
  }

  const { icon: Icon, label, className } = config[status] || config.closed

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

function MemberTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; className: string }> = {
    conversational_character: { label: "可对话", className: "bg-cyan-500/20 text-cyan-400" },
    silent_member: { label: "沉默成员", className: "bg-amber-500/20 text-amber-400" },
    display_object: { label: "陈列物", className: "bg-violet-500/20 text-violet-400" },
  }

  const { label, className } = config[type] || { label: type, className: "bg-gray-500/20 text-gray-400" }

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

function HomeCard({ home, isOwner }: { home: Home; isOwner: boolean }) {
  return (
    <Card className="overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-32 bg-gradient-to-br from-violet-600 to-cyan-600">
        {home.cover_image && (
          <img src={home.cover_image} alt="" className="h-full w-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Status Badge */}
        <div className="absolute right-3 top-3">
          <HomeStatusBadge status={home.status} />
        </div>
      </div>

      <CardHeader className="relative -mt-8 pb-2">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="h-16 w-16 overflow-hidden rounded-xl border-2 border-white/20 bg-white/10 shadow-lg">
            {home.avatar ? (
              <img src={home.avatar} alt={home.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <HomeIcon className="h-8 w-8 text-white/60" />
              </div>
            )}
          </div>

          <div className="flex-1 pt-4">
            <CardTitle className="text-xl text-white">{home.name}</CardTitle>
            {home.description && (
              <CardDescription className="mt-1 line-clamp-2 text-white/60">
                {home.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-white/70">
            <Users className="h-4 w-4" />
            <span>{home.members?.length || 0} 位成员</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/70">
            <Eye className="h-4 w-4" />
            <span>{home.visit_settings?.public ? "对所有人开放" : "不对外开放"}</span>
          </div>
        </div>

        {/* Members Preview */}
        {home.members && home.members.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white/80">成员</h4>
            <div className="flex flex-wrap gap-2">
              {home.members.slice(0, 6).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm"
                >
                  {member.avatar ? (
                    <img src={member.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-violet-500/30" />
                  )}
                  <span className="text-white/80">{member.display_name || member.name}</span>
                  <MemberTypeBadge type={member.member_type} />
                </div>
              ))}
              {home.members.length > 6 && (
                <span className="flex items-center rounded-full bg-white/5 px-3 py-1.5 text-sm text-white/50">
                  +{home.members.length - 6} 更多
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {isOwner && (
          <div className="flex gap-2 pt-2">
            <Button asChild variant="secondary" size="sm">
              <Link to={`/owner?owner_id=${home.owner_id}`}>管理</Link>
            </Button>
            <Button asChild size="sm">
              <Link to={`/home/${home.id}`}>进入</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CreateHomeDialog({ ownerId }: { ownerId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          创建我的小窝
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>创建个人小窝</DialogTitle>
          <DialogDescription>
            打造你的专属空间，可以添加角色、物品，与访客互动。
          </DialogDescription>
        </DialogHeader>

        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="create" />
          <input type="hidden" name="owner_id" value={ownerId} />

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-white/80">
              小窝名称
            </label>
            <input
              id="name"
              name="name"
              placeholder="例如：赛博茶馆、午夜书房"
              required
              className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-white/80">
              描述
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="描述一下你的小窝..."
              rows={3}
              className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="theme" className="text-sm font-medium text-white/80">
              主题风格
            </label>
            <select
              id="theme"
              name="theme"
              defaultValue="cozy"
              className="w-full rounded-2xl border border-white/12 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
            >
              <option value="cozy">温馨舒适</option>
              <option value="cyber">赛博朋克</option>
              <option value="mystic">神秘奇幻</option>
              <option value="modern">现代简约</option>
              <option value="vintage">复古怀旧</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="public" name="public" value="true" defaultChecked />
            <label htmlFor="public" className="text-sm text-white/70">
              对所有人开放参观
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit">创建</Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function HomeVisitorView({ home }: { home: Home }) {
  const [message, setMessage] = useState("")
  const [chatLog, setChatLog] = useState<Array<{ from: string; text: string }>>([])

  async function handleChat(e: FormEvent) {
    e.preventDefault()
    if (!message.trim()) return

    const userMessage = message
    setMessage("")
    setChatLog((prev) => [...prev, { from: "你", text: userMessage }])

    try {
      // 找到第一个可对话的成员
      const speakingMember = home.members?.find((m) => m.member_type === "conversational_character")
      if (speakingMember) {
        const result = await chatWithHomeMember(home.id, speakingMember.id, userMessage)
        if (result.message) {
          setChatLog((prev) => [
            ...prev,
            { from: speakingMember.display_name || speakingMember.name, text: result.message },
          ])
        }
      } else {
        setChatLog((prev) => [
          ...prev,
          { from: "系统", text: "这里没有人能和你对话..." },
        ])
      }
    } catch {
      setChatLog((prev) => [
        ...prev,
        { from: "系统", text: "无法发送消息" },
      ])
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">访客留言</h3>
        <Form method="post" className="space-y-3">
          <input type="hidden" name="intent" value="leave_message" />
          <input type="hidden" name="home_id" value={home.id} />
          <textarea
            name="message"
            placeholder="写下你的留言..."
            rows={3}
            className="min-h-[80px] w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60"
          />
          <Button type="submit" size="sm">
            留下足迹
          </Button>
        </Form>
      </div>

      {/* Chat */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <MessageCircle className="h-5 w-5" />
          与成员互动
        </h3>

        {/* Chat Log */}
        {chatLog.length > 0 && (
          <div className="mb-4 space-y-3 rounded-lg bg-black/20 p-4">
            {chatLog.map((entry, i) => (
              <div key={i} className={entry.from === "你" ? "text-right" : "text-left"}>
                <span className="text-xs text-white/50">{entry.from}</span>
                <p className={`rounded-lg px-3 py-2 ${
                  entry.from === "你"
                    ? "ml-auto bg-cyan-500/20 text-cyan-200"
                    : entry.from === "系统"
                    ? "bg-gray-500/20 text-gray-400"
                    : "bg-violet-500/20 text-violet-200"
                }`}>
                  {entry.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Chat Input */}
        <form onSubmit={handleChat} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="发送消息..."
            className="flex-1 w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-cyan-300/60"
          />
          <Button type="submit" disabled={!message.trim()}>
            发送
          </Button>
        </form>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────

export default function HomeMePage() {
  const { home, ownerId, visitResult, error } = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate()
  const isOwner = true // TODO: 实际根据 userId 判断

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050615]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-400">加载失败：{error}</p>
            <Button onClick={() => navigate(-1)} className="mt-4 w-full">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050615]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#050615]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">
              {visitResult ? `欢迎来到 ${visitResult.name}` : "我的小窝"}
            </h1>
          </div>

          {!visitResult && isOwner && !home && (
            <CreateHomeDialog ownerId={ownerId} />
          )}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        {visitResult ? (
          // 访客视角
          <div className="space-y-6">
            {!visitResult.can_enter ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <Lock className="h-12 w-12 text-amber-400" />
                    <p className="text-lg text-white">{visitResult.message || "无法进入"}</p>
                    <Button variant="secondary" onClick={() => navigate("/discover")}>
                      去探索其他小窝
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : home ? (
              <>
                <HomeCard home={home} isOwner={false} />
                <HomeVisitorView home={home} />
              </>
            ) : null}
          </div>
        ) : home ? (
          // 主人视角
          <div className="space-y-6">
            <HomeCard home={home} isOwner={true} />

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-cyan-400">
                      {home.members?.filter((m) => m.member_type === "conversational_character").length || 0}
                    </p>
                    <p className="mt-1 text-sm text-white/60">可对话成员</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-violet-400">
                      {home.members?.filter((m) => m.member_type === "silent_member").length || 0}
                    </p>
                    <p className="mt-1 text-sm text-white/60">沉默成员</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-400">
                      {home.members?.filter((m) => m.member_type === "display_object").length || 0}
                    </p>
                    <p className="mt-1 text-sm text-white/60">陈列物品</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Members Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>成员管理</CardTitle>
                    <CardDescription>添加角色、物品到你的小窝</CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                    添加成员
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {home.members && home.members.length > 0 ? (
                  <div className="space-y-3">
                    {home.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                      >
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-violet-500/20">
                          {member.avatar ? (
                            <img src={member.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-white/40">
                              <Users className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{member.display_name || member.name}</p>
                          <p className="text-sm text-white/50">{member.description || "无描述"}</p>
                        </div>
                        <MemberTypeBadge type={member.member_type} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-white/50">
                    <Users className="mx-auto h-12 w-12 opacity-30" />
                    <p className="mt-2">还没有添加任何成员</p>
                    <p className="text-sm">添加角色、物品来丰富你的小窝</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          // 未创建
          <div className="flex flex-col items-center gap-6 py-16 text-center">
            <div className="rounded-full bg-violet-500/20 p-8">
              <HomeIcon className="h-16 w-16 text-violet-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">还没有小窝</h2>
              <p className="mt-2 text-white/60">创建你的个人小窝，邀请朋友来访</p>
            </div>
            <CreateHomeDialog ownerId={ownerId} />
          </div>
        )}
      </main>
    </div>
  )
}

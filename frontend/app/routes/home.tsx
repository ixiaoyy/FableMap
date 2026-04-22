import { MessageCircle, Store, WandSparkles } from "lucide-react"
import { Link } from "react-router"

import { ProductShell } from "../shell/product-shell"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

const cards = [
  { icon: Store, title: "真实地点开店", text: "酒馆必须挂接真实坐标，地图是空间锚点，不做无锚点自由空间。" },
  { icon: MessageCircle, title: "AI NPC 对话", text: "AI 只作为 NPC 对话与体验引擎，酒馆内容仍由店主创作和确认。" },
  { icon: WandSparkles, title: "记忆与回访", text: "对话、玩法和写回记录沉淀为可回访体验，而不是一次性 demo。" },
]

export default function HomeRoute() {
  return (
    <ProductShell eyebrow="Real places, living taverns">
      <section className="grid gap-7 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-7">
          <div className="space-y-5">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-100">FableMap Enterprise Frontend</p>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.07em] text-white sm:text-7xl">
              把真实地点变成可进入、可回访的赛博酒馆。
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-violet-100/72">
              新前端使用 React Router Framework Mode、Tailwind CSS 和 Radix/shadcn 风格的自有组件系统，面向消费者和创作者体验，而不是后台模板。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/discover">开始探索</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/create">开一间酒馆</Link>
            </Button>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-violet-400/18 to-cyan-300/10">
          <CardHeader>
            <CardTitle>产品体验，不是后台</CardTitle>
            <CardDescription>店主工具、访客入口、NPC 对话都围绕 FableMap 自有视觉和交互。</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="explorer">
              <TabsList>
                <TabsTrigger value="explorer">探索者</TabsTrigger>
                <TabsTrigger value="keeper">店主</TabsTrigger>
              </TabsList>
              <TabsContent value="explorer" className="leading-7 text-violet-100/72">
                浏览真实地图上的酒馆，进入公共或密码酒馆，与 AI NPC 对话并形成回访记忆。
              </TabsContent>
              <TabsContent value="keeper" className="leading-7 text-violet-100/72">
                选择地点、配置角色卡、设定 LLM 与访问规则，发布属于自己的赛博酒馆。
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((item) => (
          <Card key={item.title} className="min-h-52">
            <item.icon className="mb-5 h-7 w-7 text-cyan-200" />
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <CardDescription className="mt-3">{item.text}</CardDescription>
          </Card>
        ))}
      </section>
    </ProductShell>
  )
}

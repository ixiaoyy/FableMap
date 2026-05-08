import {
  ArrowRight,
  Brain,
  KeyRound,
  LockKeyhole,
  MapPinned,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react"
import { Link, useLoaderData } from "react-router"

import discoverRadarSurfaceImage from "../assets/discover/reference/discover-radar-surface.png"
import memoryModuleImage from "../assets/homepage/reference/modules/memory-module.png"
import npcDialogueImage from "../assets/homepage/reference/modules/npc-dialogue.png"
import lightSkyBg from "../assets/homepage/light/light-sky-bg.png"
import lightNpcHero from "../assets/homepage/light/light-npc-hero.png"
import lightRadarSurface from "../assets/homepage/light/light-radar-surface.png"
import homeLightSliceNavBar from "../assets/homepage/light/slices/home-light-slice-01a-nav-bar.png"
import homeLightSliceNavBar2x from "../assets/homepage/light/slices/home-light-slice-01a-nav-bar-2x.png"
import homeLightSliceHeroMain from "../assets/homepage/light/slices/home-light-slice-01b-hero-main.png"
import homeLightSliceHeroMain2x from "../assets/homepage/light/slices/home-light-slice-01b-hero-main-2x.png"
import homeLightSliceFeaturedHeading from "../assets/homepage/light/slices/home-light-slice-02a-featured-heading.png"
import homeLightSliceFeaturedHeading2x from "../assets/homepage/light/slices/home-light-slice-02a-featured-heading-2x.png"
import homeLightSliceFeaturedCardCovers from "../assets/homepage/light/slices/home-light-slice-02b1-featured-card-covers.png"
import homeLightSliceFeaturedCardCovers2x from "../assets/homepage/light/slices/home-light-slice-02b1-featured-card-covers-2x.png"
import homeLightSliceFeaturedCardInfo from "../assets/homepage/light/slices/home-light-slice-02b2-featured-card-info.png"
import homeLightSliceFeaturedCardInfo2x from "../assets/homepage/light/slices/home-light-slice-02b2-featured-card-info-2x.png"
import homeLightSliceFeaturedBottom from "../assets/homepage/light/slices/home-light-slice-02c-featured-bottom.png"
import homeLightSliceFeaturedBottom2x from "../assets/homepage/light/slices/home-light-slice-02c-featured-bottom-2x.png"
import homeLightSliceAiRolesHeading from "../assets/homepage/light/slices/home-light-slice-03a-ai-roles-heading.png"
import homeLightSliceAiRolesHeading2x from "../assets/homepage/light/slices/home-light-slice-03a-ai-roles-heading-2x.png"
import homeLightSliceAiRolesCardRow from "../assets/homepage/light/slices/home-light-slice-03b-ai-roles-card-row.png"
import homeLightSliceAiRolesCardRow2x from "../assets/homepage/light/slices/home-light-slice-03b-ai-roles-card-row-2x.png"
import homeLightSliceAiRolesBottom from "../assets/homepage/light/slices/home-light-slice-03c-ai-roles-bottom.png"
import homeLightSliceAiRolesBottom2x from "../assets/homepage/light/slices/home-light-slice-03c-ai-roles-bottom-2x.png"
import homeLightSliceMemoryEchoes from "../assets/homepage/light/slices/home-light-slice-04-memory-echoes.png"
import homeLightSliceMemoryEchoes2x from "../assets/homepage/light/slices/home-light-slice-04-memory-echoes-2x.png"
import homeLightSliceRecommendedCoordinates from "../assets/homepage/light/slices/home-light-slice-05-recommended-coordinates.png"
import homeLightSliceRecommendedCoordinates2x from "../assets/homepage/light/slices/home-light-slice-05-recommended-coordinates-2x.png"
import homeLightSliceCtaFooter from "../assets/homepage/light/slices/home-light-slice-06-cta-footer.png"
import homeLightSliceCtaFooter2x from "../assets/homepage/light/slices/home-light-slice-06-cta-footer-2x.png"
import { HOMEPAGE_NPC_PREVIEW_PORTRAITS } from "../features/tavern-npc-stage/portraitCatalogConfig"
import { buildHomepageView, type HomepageMetric, type HomepageMetricId } from "../lib/homepage-taverns"
import { errorMessage, listTaverns, type TavernListResponse } from "../lib/taverns"
import { useTheme } from "../hooks/useTheme"
import { Button } from "../ui/button"

type Metric = HomepageMetric & {
  icon: LucideIcon
}

type CitySlicePreview = {
  image: string
  name: string
  location: string
  entryMeta: string
  tags: string[]
  id: string
}

type Feature = {
  icon: LucideIcon
  title: string
  text: string
}

type HomeLoaderData = {
  result: TavernListResponse
  error: string
}

const navItems = [
  { to: "/discover", label: "探索" },
  { to: "/discover", label: "区域" },
  { to: "/discover", label: "角色" },
  { to: "/discover", label: "记忆" },
  { to: "/create", label: "创建空间" },
]

const metricIcons: Record<HomepageMetricId, LucideIcon> = {
  coordinates: MapPinned,
  characters: UsersRound,
  encounters: MessageCircle,
  open: Star,
}

const features: Feature[] = [
  { icon: MapPinned, title: "真实坐标", text: "每个入口都落在现实地图上，而不是漂浮空间。" },
  { icon: Brain, title: "记忆回响", text: "角色和区域会保留回访上下文，让相遇不只是一次性对话。" },
  { icon: ShieldCheck, title: "主人边界", text: "内容、访问和记忆权限由空间主人控制，平台不越权发布。" },
]

const portraits = HOMEPAGE_NPC_PREVIEW_PORTRAITS

function withMetricIcons(metrics: HomepageMetric[]): Metric[] {
  return metrics.map((metric) => ({
    ...metric,
    icon: metricIcons[metric.id],
  }))
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full text-theme-muted hover:text-theme-primary"
      aria-label="切换主题"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

function HomeNav() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <header className={`sticky top-0 z-40 border-b ${isDark ? "border-theme-border bg-theme-header" : "border-indigo-100/50 bg-white/70"} backdrop-blur-xl`}>
      <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-4">
        <Link to="/" className="flex touch-manipulation items-center gap-3">
          <span className={`grid h-10 w-10 place-items-center rounded-full border ${isDark ? "border-theme-accent-border bg-theme-accent-bg text-theme-accent-text" : "border-indigo-300 bg-indigo-50 text-indigo-600"} text-sm font-black`}>
            FM
          </span>
          <div className="hidden sm:block">
            <p className={`font-black tracking-wide ${isDark ? "text-theme-primary" : "text-indigo-900"}`}>FableMap</p>
            <p className={`text-[0.65rem] ${isDark ? "text-theme-muted" : "text-indigo-400"}`}>Cyber life on real coordinates</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link key={item.label} to={item.to} className={`text-sm font-bold transition ${isDark ? "text-theme-muted hover:text-theme-primary" : "text-indigo-900/60 hover:text-indigo-600"}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-4 lg:max-w-md lg:justify-normal">
          <div className="relative flex-1">
            <Search className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? "text-theme-muted" : "text-indigo-300"}`} />
            <input
              type="text"
              placeholder="搜索附近坐标、角色、记忆线索"
              className={`h-11 w-full rounded-full border ${isDark ? "border-theme-border bg-theme-bg" : "border-indigo-100/50 bg-white/80"} pl-11 pr-4 text-sm outline-none transition focus:border-indigo-400/50`}
            />
            {!isDark && <Sparkles className="absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-indigo-200" />}
          </div>
          <ThemeToggle />
          <Link to="/tavern-owner-management" className={`hidden text-sm font-black transition sm:block ${isDark ? "text-theme-muted hover:text-theme-primary" : "text-indigo-600 hover:text-indigo-800"}`}>
            管理入口
          </Link>
          <Button asChild size="sm" className="hidden lg:flex">
            <Link to="/discover">开始探索</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

function MetricCard({ value, label, id }: HomepageMetric) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const iconIdx = ["coordinates", "characters", "encounters", "open"].indexOf(id)
  const portrait = HOMEPAGE_NPC_PREVIEW_PORTRAITS[iconIdx] || HOMEPAGE_NPC_PREVIEW_PORTRAITS[0]

  return (
    <div className={`group relative p-3 sm:p-4 ${isDark ? "rounded-2xl border border-theme-border bg-theme-card" : "ornate-card"}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-theme-muted" : "text-indigo-400"}`}>
            {label}
          </p>
          <p className={`text-2xl font-black ${isDark ? "text-theme-primary" : "text-indigo-950"}`}>
            {value}
            <span className="ml-1 text-sm font-medium opacity-50">+</span>
          </p>
        </div>
        <div className={`h-12 w-12 overflow-hidden rounded-xl border ${isDark ? "border-theme-border" : "border-indigo-100 shadow-sm"}`}>
          <img src={portrait} alt="" className="h-full w-full object-cover transition group-hover:scale-110" />
        </div>
      </div>
      {!isDark && (
        <>
          <div className="ornate-corner -left-1 -top-1 border-l-2 border-t-2 rounded-tl-lg" />
          <div className="ornate-corner -right-1 -bottom-1 border-r-2 border-b-2 rounded-br-lg" />
        </>
      )}
    </div>
  )
}

function DesktopMetricRail({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="hidden lg:grid lg:grid-cols-2 lg:gap-3">
      {metrics.map(({ icon: Icon, value, label }) => (
        <div key={label} className="rounded-2xl border border-theme-border bg-theme-card p-4 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <Icon className="h-5 w-5 text-theme-accent-text" />
            <span className="h-px flex-1 bg-theme-accent-bg" />
          </div>
          <p className="mt-3 text-2xl font-black text-theme-primary">{value}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-theme-muted">{label}</p>
        </div>
      ))}
    </div>
  )
}

function CitySlicePreviewCard({ image, name, location, entryMeta, tags, id }: CitySlicePreview) {
  return (
    <Link
      to={`/tavern/${id}`}
      className="group ornate-frame touch-manipulation overflow-hidden transition hover:-translate-y-1 hover:border-theme-accent-border"
    >
      <div className="relative h-64 overflow-hidden lg:h-72">
        <img
          src={image}
          alt={`${name} 区域封面`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-theme-bg via-theme-bg/10 to-transparent" />
        <LockKeyhole className="absolute left-4 top-4 h-4 w-4 text-theme-primary/80" />
        <span className="absolute bottom-4 right-4 rounded-full border border-theme-accent-border bg-theme-accent-bg px-3 py-1 text-xs font-bold text-theme-accent-text backdrop-blur-md">
          {entryMeta}
        </span>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <h3 className="text-xl font-black text-theme-primary">{name}</h3>
          <p className="mt-1 text-sm text-theme-muted">{location}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-lg border border-theme-border bg-theme-bg px-2.5 py-1 text-xs font-bold text-theme-muted">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

function FeatureItem({ icon: Icon, title, text }: Feature) {
  return (
    <div className="rounded-2xl border border-theme-border bg-theme-card p-6">
      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-theme-accent-border bg-theme-accent-bg text-theme-accent-text">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-5 font-black text-theme-primary">{title}</p>
      <p className="mt-2 text-sm leading-6 text-theme-muted">{text}</p>
    </div>
  )
}

function EmptyCitySliceState({ error }: { error?: string }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-[1.75rem] border border-theme-border bg-theme-card text-center md:col-span-3">
      <div className="max-w-md space-y-3 px-6">
        <MapPinned className="mx-auto h-10 w-10 text-theme-accent-text opacity-65" />
        <p className="font-black text-theme-primary">暂时没有可展示的真实坐标入口</p>
        <p className="text-sm leading-6 text-theme-muted">
          {error ? `空间列表暂不可用：${error}` : "创建第一个公开空间后，这里会自动显示真实入口与对应氛围图。"}
        </p>
        <Button asChild variant="secondary">
          <Link to="/create">创建我的空间</Link>
        </Button>
      </div>
    </div>
  )
}

const LIGHT_HOME_ARTBOARD_WIDTH = 958
const LIGHT_HOME_ARTBOARD_HEIGHT = 1642

const lightHomeSlices = [
  {
    id: "01a-nav-bar",
    label: "顶部导航栏",
    src: homeLightSliceNavBar,
    src2x: homeLightSliceNavBar2x,
    y: 0,
    height: 72,
  },
  {
    id: "01b-hero-main",
    label: "首屏 Hero 主视觉",
    src: homeLightSliceHeroMain,
    src2x: homeLightSliceHeroMain2x,
    y: 72,
    height: 398,
  },
  {
    id: "02a-featured-heading",
    label: "正在发光的区域标题与装饰",
    src: homeLightSliceFeaturedHeading,
    src2x: homeLightSliceFeaturedHeading2x,
    y: 470,
    height: 82,
  },
  {
    id: "02b1-featured-card-covers",
    label: "正在发光区域卡片封面行",
    src: homeLightSliceFeaturedCardCovers,
    src2x: homeLightSliceFeaturedCardCovers2x,
    y: 552,
    height: 112,
  },
  {
    id: "02b2-featured-card-info",
    label: "正在发光区域卡片文字与标签行",
    src: homeLightSliceFeaturedCardInfo,
    src2x: homeLightSliceFeaturedCardInfo2x,
    y: 664,
    height: 83,
  },
  {
    id: "02c-featured-bottom",
    label: "正在发光的区域底部过渡",
    src: homeLightSliceFeaturedBottom,
    src2x: homeLightSliceFeaturedBottom2x,
    y: 747,
    height: 18,
  },
  {
    id: "03a-ai-roles-heading",
    label: "AI 角色相遇标题与查看入口",
    src: homeLightSliceAiRolesHeading,
    src2x: homeLightSliceAiRolesHeading2x,
    y: 765,
    height: 48,
  },
  {
    id: "03b-ai-roles-card-row",
    label: "AI 角色相遇卡片行",
    src: homeLightSliceAiRolesCardRow,
    src2x: homeLightSliceAiRolesCardRow2x,
    y: 813,
    height: 112,
  },
  {
    id: "03c-ai-roles-bottom",
    label: "AI 角色相遇底部过渡",
    src: homeLightSliceAiRolesBottom,
    src2x: homeLightSliceAiRolesBottom2x,
    y: 925,
    height: 10,
  },
  {
    id: "04-memory-echoes",
    label: "记忆回响",
    src: homeLightSliceMemoryEchoes,
    src2x: homeLightSliceMemoryEchoes2x,
    y: 935,
    height: 185,
  },
  {
    id: "05-recommended-coordinates",
    label: "特色区域推荐",
    src: homeLightSliceRecommendedCoordinates,
    src2x: homeLightSliceRecommendedCoordinates2x,
    y: 1120,
    height: 245,
  },
  {
    id: "06-cta-footer",
    label: "底部 CTA 与 footer",
    src: homeLightSliceCtaFooter,
    src2x: homeLightSliceCtaFooter2x,
    y: 1365,
    height: 277,
  },
] as const

type LightHomeSlice = (typeof lightHomeSlices)[number]

type LightHomeHotspot = {
  sliceId: LightHomeSlice["id"]
  label: string
  to?: string
  onClick?: () => void
  left: number
  top: number
  width: number
  height: number
  shape?: "pill" | "card"
}

function lightHotspotStyle(hotspot: LightHomeHotspot) {
  return {
    left: `${hotspot.left}%`,
    top: `${hotspot.top}%`,
    width: `${hotspot.width}%`,
    height: `${hotspot.height}%`,
  }
}

function LightReferenceHome({ featuredCitySlices }: { featuredCitySlices: CitySlicePreview[] }) {
  const { toggleTheme } = useTheme()
  const cardTargets = [
    featuredCitySlices[0]?.id ? `/tavern/${featuredCitySlices[0].id}` : "/discover",
    featuredCitySlices[1]?.id ? `/tavern/${featuredCitySlices[1].id}` : "/discover",
    featuredCitySlices[2]?.id ? `/tavern/${featuredCitySlices[2].id}` : "/discover",
  ]
  const hotspotClass = "absolute border-0 bg-transparent p-0 outline-none transition focus-visible:ring-4 focus-visible:ring-indigo-400/55"
  const hotspots: LightHomeHotspot[] = [
    { sliceId: "01a-nav-bar", to: "/", label: "返回 FableMap 首页", left: 4.0, top: 1.0, width: 16.0, height: 3.3 },
    { sliceId: "01a-nav-bar", to: "/discover", label: "导航到探索", left: 29.3, top: 1.6, width: 4.8, height: 1.9 },
    { sliceId: "01a-nav-bar", to: "/discover", label: "导航到区域", left: 35.4, top: 1.6, width: 4.8, height: 1.9 },
    { sliceId: "01a-nav-bar", to: "/discover", label: "导航到角色", left: 41.0, top: 1.6, width: 4.8, height: 1.9 },
    { sliceId: "01a-nav-bar", to: "/home-me", label: "导航到记忆", left: 47.2, top: 1.6, width: 4.8, height: 1.9 },
    { sliceId: "01a-nav-bar", to: "/create", label: "创建空间", left: 53.0, top: 1.6, width: 7.4, height: 1.9 },
    { sliceId: "01a-nav-bar", to: "/discover", label: "搜索附近坐标、角色、记忆线索", left: 59.6, top: 1.2, width: 20.6, height: 2.9 },
    { sliceId: "01a-nav-bar", onClick: toggleTheme, label: "切换到深色主题", left: 80.6, top: 1.2, width: 4.2, height: 2.9 },
    { sliceId: "01a-nav-bar", to: "/tavern-owner-management", label: "管理入口", left: 85.1, top: 1.2, width: 6.7, height: 2.9 },
    { sliceId: "01a-nav-bar", to: "/discover", label: "开始探索", left: 91.8, top: 1.0, width: 6.9, height: 3.2 },
    { sliceId: "01b-hero-main", to: "/discover", label: "开始探索真实坐标", left: 5.0, top: 14.2, width: 11.9, height: 2.8 },
    { sliceId: "01b-hero-main", to: "/create", label: "创建我的空间", left: 17.2, top: 14.2, width: 13.2, height: 2.8 },
    { sliceId: "01b-hero-main", to: "/discover", label: "探索真实坐标", left: 77.7, top: 23.0, width: 17.8, height: 3.1 },

    { sliceId: "02a-featured-heading", to: "/discover", label: "查看全部发光区域", left: 81.2, top: 30.0, width: 10.6, height: 2.3 },
    { sliceId: "02b2-featured-card-info", to: cardTargets[0], label: "进入第一个发光区域", left: 6.3, top: 32.8, width: 28.6, height: 13.2, shape: "card" },
    { sliceId: "02b2-featured-card-info", to: cardTargets[1], label: "进入第二个发光区域", left: 35.7, top: 32.8, width: 28.6, height: 13.2, shape: "card" },
    { sliceId: "02b2-featured-card-info", to: cardTargets[2], label: "进入第三个发光区域", left: 65.0, top: 32.8, width: 28.6, height: 13.2, shape: "card" },

    { sliceId: "03a-ai-roles-heading", to: "/discover", label: "查看全部角色", left: 81.0, top: 47.3, width: 11.0, height: 2.0 },
    { sliceId: "03b-ai-roles-card-row", to: "/discover", label: "和第一个 AI 角色对话", left: 5.7, top: 49.2, width: 22.0, height: 7.6, shape: "card" },
    { sliceId: "03b-ai-roles-card-row", to: "/discover", label: "和第二个 AI 角色对话", left: 28.2, top: 49.2, width: 22.0, height: 7.6, shape: "card" },
    { sliceId: "03b-ai-roles-card-row", to: "/discover", label: "和第三个 AI 角色对话", left: 50.7, top: 49.2, width: 22.0, height: 7.6, shape: "card" },
    { sliceId: "03b-ai-roles-card-row", to: "/discover", label: "和第四个 AI 角色对话", left: 73.2, top: 49.2, width: 22.0, height: 7.6, shape: "card" },

    { sliceId: "04-memory-echoes", to: "/home-me", label: "查看更多记忆", left: 81.0, top: 58.2, width: 11.0, height: 2.0 },
    { sliceId: "04-memory-echoes", to: "/home-me", label: "打开第一段记忆回响", left: 5.9, top: 60.6, width: 21.6, height: 6.7, shape: "card" },
    { sliceId: "04-memory-echoes", to: "/home-me", label: "打开第二段记忆回响", left: 28.2, top: 60.6, width: 21.6, height: 6.7, shape: "card" },
    { sliceId: "04-memory-echoes", to: "/home-me", label: "打开第三段记忆回响", left: 50.5, top: 60.6, width: 21.6, height: 6.7, shape: "card" },
    { sliceId: "04-memory-echoes", to: "/home-me", label: "打开第四段记忆回响", left: 72.8, top: 60.6, width: 21.6, height: 6.7, shape: "card" },

    { sliceId: "05-recommended-coordinates", to: "/discover", label: "查看全部区域", left: 81.0, top: 68.6, width: 11.0, height: 2.0 },
    { sliceId: "05-recommended-coordinates", to: cardTargets[0], label: "进入推荐坐标云湖图书馆", left: 6.3, top: 70.5, width: 28.6, height: 12.3, shape: "card" },
    { sliceId: "05-recommended-coordinates", to: cardTargets[1], label: "进入推荐坐标风之钟楼", left: 35.7, top: 70.5, width: 28.6, height: 12.3, shape: "card" },
    { sliceId: "05-recommended-coordinates", to: cardTargets[2], label: "进入推荐坐标樱花车站", left: 65.0, top: 70.5, width: 28.6, height: 12.3, shape: "card" },
    { sliceId: "06-cta-footer", to: "/create", label: "创建我的空间并邀请角色与记忆", left: 58.8, top: 84.0, width: 19.8, height: 3.6 },
  ]

  return (
    <main data-home-light-reference="index-light-coarse-sliced-1to1" className="min-h-screen bg-[#dfeaff] p-0 text-[#1e2a78] sm:p-4">
      <h1 className="sr-only">FableMap — 真实坐标，藏着会回应的世界</h1>
      <div data-home-light-artboard="index-light-958x1642" data-home-light-slice-count={lightHomeSlices.length} className="relative mx-auto w-full max-w-[958px] overflow-hidden bg-[#eef5ff] shadow-[0_24px_80px_rgba(67,88,180,0.18)]">
        {lightHomeSlices.map((slice, index) => (
          <section key={slice.id} data-home-light-slice={slice.id} className="relative block overflow-hidden" aria-label={slice.label}>
            <img
              src={slice.src}
              srcSet={`${slice.src} 1x, ${slice.src2x} 2x`}
              sizes="(max-width: 958px) 100vw, 958px"
              alt={index === 0 ? "FableMap 明亮主题首页：导航、真实坐标首屏与雷达视觉" : ""}
              className="block w-full select-none"
              width={LIGHT_HOME_ARTBOARD_WIDTH}
              height={slice.height}
              decoding="async"
              fetchPriority={index === 0 ? "high" : "auto"}
              draggable={false}
            />
          </section>
        ))}
        <div className="absolute inset-0" aria-label="明亮首页交互热区">
          {hotspots.map((hotspot) => {
            const className = `${hotspotClass} ${hotspot.shape === "card" ? "rounded-[1.4rem]" : "rounded-full"}`
            const style = lightHotspotStyle(hotspot)
            return hotspot.to ? (
              <Link key={hotspot.label} data-home-hotspot-slice={hotspot.sliceId} to={hotspot.to} aria-label={hotspot.label} className={className} style={style} />
            ) : (
              <button key={hotspot.label} data-home-hotspot-slice={hotspot.sliceId} type="button" aria-label={hotspot.label} onClick={hotspot.onClick} className={className} style={style} />
            )
          })}
        </div>
      </div>
    </main>
  )
}

function HeroPosterPreview() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className={`relative min-h-[420px] overflow-hidden rounded-[1.75rem] border ${isDark ? "border-theme-accent-border bg-slate-950 shadow-[0_26px_80px_rgba(0,0,0,0.18)]" : "border-indigo-200 bg-white shadow-[0_20px_50px_rgba(59,130,246,0.08)]"} lg:min-h-[560px]`}>
      <img
        src={isDark ? discoverRadarSurfaceImage : lightRadarSurface}
        alt="FableMap 真实坐标雷达视觉"
        className={`absolute inset-0 h-full w-full object-cover object-center ${isDark ? "" : "opacity-90 contrast-[1.1]"}`}
        decoding="async"
      />
      <div className={`absolute inset-0 ${isDark ? "bg-[radial-gradient(circle_at_53%_51%,rgba(0,229,255,0.16),transparent_16rem),linear-gradient(90deg,rgba(3,5,18,0.82),rgba(3,5,18,0.24)_48%,rgba(3,5,18,0.62))]" : "bg-[radial-gradient(circle_at_53%_51%,rgba(59,130,246,0.1),transparent_20rem),linear-gradient(90deg,rgba(255,255,255,0.9),rgba(255,255,255,0.4)_48%,rgba(255,255,255,0.85))]"}`} />
      <div className={`absolute inset-4 rounded-[1.35rem] border ${isDark ? "border-cyan-200/18 bg-[linear-gradient(90deg,rgba(125,249,255,0.07)_1px,transparent_1px),linear-gradient(0deg,rgba(125,249,255,0.05)_1px,transparent_1px)]" : "border-blue-500/10 bg-[linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(59,130,246,0.03)_1px,transparent_1px)]"} bg-[size:42px_42px]`} />
      <div className={`absolute left-4 top-4 rounded-full border ${isDark ? "border-cyan-300/36 bg-cyan-300/12 text-cyan-100" : "border-blue-300/30 bg-blue-50 text-blue-600"} px-4 py-2 text-xs font-black uppercase tracking-[0.22em] backdrop-blur-md`}>
        Signal detected
      </div>
      <div className={`absolute right-4 top-4 hidden rounded-2xl border ${isDark ? "border-white/14 bg-slate-950/56 text-white" : "border-blue-100 bg-white/80 text-blue-900"} p-3 text-right backdrop-blur-xl sm:block`}>
        <p className={`text-[0.65rem] font-black uppercase tracking-[0.18em] ${isDark ? "text-cyan-100/74" : "text-blue-500/74"}`}>Live radius</p>
        <p className="mt-1 text-lg font-black">2.4 km</p>
      </div>
      <div className="absolute left-8 right-8 top-[5.8rem] hidden items-center gap-3 lg:flex">
        <span className={`h-px flex-1 ${isDark ? "bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" : "bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"}`} />
        <span className={`rounded-full border ${isDark ? "border-white/12 bg-slate-950/46 text-violet-100/64" : "border-blue-100 bg-white/60 text-blue-500/70"} px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.22em] backdrop-blur-md`}>
          Coordinate grid / Memory field / NPC signal
        </span>
        <span className={`h-px flex-1 ${isDark ? "bg-gradient-to-r from-transparent via-fuchsia-300/28 to-transparent" : "bg-gradient-to-r from-transparent via-indigo-400/15 to-transparent"}`} />
      </div>
      <div className={`absolute left-[22%] top-[34%] h-4 w-4 rounded-full border ${isDark ? "border-cyan-100 bg-cyan-300 shadow-[0_0_32px_rgba(34,211,238,0.95)]" : "border-blue-400 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"}`} />
      <div className={`absolute right-[25%] top-[42%] h-3 w-3 rounded-full border ${isDark ? "border-fuchsia-100 bg-fuchsia-300 shadow-[0_0_30px_rgba(217,70,239,0.85)]" : "border-indigo-300 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]"}`} />
      <div className={`absolute bottom-[28%] right-[14%] h-3.5 w-3.5 rounded-full border ${isDark ? "border-cyan-100 bg-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.85)]" : "border-blue-400 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"}`} />
      <div className={`absolute bottom-5 left-5 max-w-md rounded-3xl border ${isDark ? "border-white/14 bg-slate-950/62" : "border-blue-100 bg-white/90"} p-4 backdrop-blur-xl sm:p-5`}>
        <p className={`text-xs font-black uppercase tracking-[0.2em] ${isDark ? "text-cyan-100/80" : "text-blue-600/80"}`}>35.6987, 139.7713 · 23:47</p>
        <p className={`mt-3 text-sm leading-6 ${isDark ? "text-violet-100/82" : "text-blue-900/70"}`}>不是普通地图标记。坐标、角色和记忆同时亮起，等待你进入。</p>
      </div>
      <div className={`absolute right-5 top-28 hidden w-44 rounded-3xl border ${isDark ? "border-cyan-300/18 bg-slate-950/50" : "border-blue-100 bg-white/70"} p-4 backdrop-blur-xl lg:block`}>
        <p className={`text-[0.65rem] font-black uppercase tracking-[0.2em] ${isDark ? "text-cyan-100/64" : "text-blue-500/64"}`}>Active layers</p>
        <div className={`mt-3 space-y-2 text-xs font-bold ${isDark ? "text-violet-100/68" : "text-blue-900/50"}`}>
          <p className="flex items-center justify-between"><span>坐标入口</span><span className={`${isDark ? "text-cyan-100" : "text-blue-600"}`}>ON</span></p>
          <p className="flex items-center justify-between"><span>角色信号</span><span className={`${isDark ? "text-fuchsia-100" : "text-indigo-600"}`}>356</span></p>
          <p className="flex items-center justify-between"><span>记忆回响</span><span className={`${isDark ? "text-cyan-100" : "text-blue-600"}`}>LIVE</span></p>
        </div>
      </div>
      <div className={`absolute bottom-5 right-5 hidden rounded-full border ${isDark ? "border-fuchsia-300/28 bg-fuchsia-300/12 text-fuchsia-100" : "border-blue-300/30 bg-blue-50 text-blue-600"} px-4 py-2 text-xs font-black backdrop-blur-md md:block`}>
        EXPLORE / REAL COORDINATE
      </div>
    </div>
  )
}

export async function clientLoader(): Promise<HomeLoaderData> {
  try {
    return { result: await listTaverns(), error: "" }
  } catch (error) {
    return { result: { taverns: [], count: 0 }, error: errorMessage(error) }
  }
}

export default function HomeRoute() {
  const { result, error } = useLoaderData<typeof clientLoader>()
  const homepage = buildHomepageView(result, error)
  const metrics = withMetricIcons(homepage.metrics)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  if (!isDark) {
    return <LightReferenceHome featuredCitySlices={homepage.featuredCitySlices} />
  }

  return (
    <main className={`min-h-screen overflow-hidden ${isDark ? "bg-theme-bg" : "bg-[#f4f7ff]"} text-theme-primary transition-colors duration-500`}>
      {!isDark && (
        <div className="fixed inset-0 z-[-1] overflow-hidden">
          <img src={lightSkyBg} alt="" className="h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#f4f7ff]/90" />
          <div className="absolute -left-10 bottom-0 z-10 hidden w-[55%] lg:block">
            <img
              src={lightNpcHero}
              alt="NPC Hero"
              className="w-full object-contain drop-shadow-[0_20px_80px_rgba(99,102,241,0.25)]"
              style={{ maskImage: 'linear-gradient(to right, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}
            />
          </div>
        </div>
      )}
      <HomeNav />

      <section className="relative mx-auto grid max-w-[1440px] gap-8 px-6 py-6 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:py-16 xl:gap-16">
        <div className="relative z-20 space-y-8">
          <div className={`inline-flex items-center gap-2 rounded-full border ${isDark ? "border-theme-accent-border bg-theme-accent-bg text-theme-accent-text" : "border-indigo-200 bg-indigo-50/80 text-indigo-600 backdrop-blur-md"} px-4 py-2 text-xs font-black uppercase tracking-[0.18em]`}>
            <Sparkles className="h-3.5 w-3.5" />
            Real coordinates. Hidden worlds.
          </div>

          <div className="space-y-6">
            <div className="relative">
              {!isDark && <span className="cursive-accent absolute -right-4 -top-8 text-[2.5rem] text-indigo-300/40 opacity-60">Coordinates</span>}
              <h1 className={`max-w-lg text-[2rem] font-bold leading-[1.2] tracking-[-0.015em] sm:text-[2.8rem] lg:text-[3.2rem] xl:text-[3.8rem] ${isDark ? "text-theme-primary" : "sparkle-text"}`}>
                <span className="block">真实坐标，</span>
                <span className="block">藏着会回应的世界</span>
              </h1>
            </div>
            <p className={`max-w-lg text-base leading-7 sm:text-lg ${isDark ? "text-theme-muted" : "font-medium text-indigo-900/60"}`}>
              在真实地图上，进入一个个由角色、记忆和主人设定共同点亮的区域。
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-14 px-8 text-base shadow-xl">
              <Link to="/discover">
                开始探索
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="h-14 px-8 text-base backdrop-blur-md">
              <Link to="/create">
                创建我的空间
                <KeyRound className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 sm:max-w-md">
            {metrics.map((m, idx) => (
              <MetricCard key={idx} {...m} />
            ))}
          </div>
        </div>

        <div className="relative z-10 lg:pt-10">
          <HeroPosterPreview />
          {!isDark && (
            <div className="absolute -bottom-10 -right-6 z-20 hidden lg:block">
              <Button size="lg" className="h-16 rounded-2xl bg-indigo-600 px-10 text-lg font-black shadow-[0_20px_50px_rgba(79,70,229,0.4)] hover:bg-indigo-700">
                探索真实坐标
                <Sparkles className="ml-2 h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="relative border-y border-theme-border bg-theme-card/30 lg:hidden">
        <div className="mx-auto grid max-w-[1320px] gap-4 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-[1320px] px-6 py-16" aria-labelledby="featured-city-slices">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-theme-accent-text opacity-75">正在发光的区域</p>
            <h2 id="featured-city-slices" className="mt-2 text-3xl font-black text-theme-primary sm:text-4xl">
              从地图进入未被看见的世界
            </h2>
          </div>
          <Button asChild variant="ghost" className="w-fit">
            <Link to="/discover">
              查看全部
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {homepage.error ? (
          <p className="mb-4 rounded-2xl border border-amber-300/24 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            空间列表暂不可用，首页已切换为安全空态：{homepage.error}
          </p>
        ) : null}
        <div className="grid gap-6 md:grid-cols-3">
          {homepage.featuredCitySlices.length ? homepage.featuredCitySlices.map((citySlice) => (
            <CitySlicePreviewCard key={citySlice.id} {...citySlice} />
          )) : <EmptyCitySliceState error={homepage.error} />}
        </div>
      </section>

      <section className="relative bg-theme-bg/90">
        <div className="mx-auto grid max-w-[1320px] gap-6 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="overflow-hidden rounded-2xl border border-theme-border bg-theme-card">
            <div className="relative h-80 overflow-hidden lg:h-[420px]">
              <img src={npcDialogueImage} alt="AI 角色相遇模块" className="h-full w-full object-cover" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-theme-bg via-theme-bg/15 to-transparent" />
              <div className="absolute bottom-5 left-6 flex -space-x-3">
                {portraits.map((portrait, index) => (
                  <img
                    key={portrait}
                    src={portrait}
                    alt={`NPC 头像 ${index + 1}`}
                    className="h-14 w-14 rounded-full border-2 border-theme-bg object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-4 p-6">
              <h2 className="text-2xl font-black text-theme-primary">AI 角色相遇</h2>
              <p className="text-sm leading-6 text-theme-muted">进入区域后，和其中的角色对话、建立关系，让一次访问变成可回访的生活片段。</p>
              <Button asChild>
                <Link to="/discover">开始对话</Link>
              </Button>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-2xl border border-theme-border bg-theme-card p-6">
            <img
              src={memoryModuleImage}
              alt="记忆模块背景"
              className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
              loading="lazy"
              decoding="async"
            />
            <div className="relative flex min-h-[420px] flex-col justify-end space-y-5">
              <h2 className="text-2xl font-black text-theme-primary">回访记忆</h2>
              <p className="max-w-md text-sm leading-6 text-theme-muted">你做过的选择、说过的话和建立过的关系，会成为下一次进入同一坐标时的上下文。</p>
              <div className="rounded-2xl border border-theme-border bg-theme-bg/60 p-4 backdrop-blur-md">
                <p className="text-sm leading-6 text-theme-primary">上次你来过这里。有人还记得你留下的问题。</p>
              </div>
              <Button asChild variant="secondary">
                <Link to="/discover">继续探索</Link>
              </Button>
            </div>
          </article>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-[1320px] gap-5 px-6 py-16 md:grid-cols-3">
        {features.map((feature) => (
          <FeatureItem key={feature.title} {...feature} />
        ))}
      </section>
    </main>
  )
}


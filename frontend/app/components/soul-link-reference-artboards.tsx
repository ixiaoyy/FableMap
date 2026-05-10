import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from "react"
import { Link } from "react-router"

import discoverBlackMain from "../assets/soul-link-05-10/discover-black/main.png"
import discoverBlackMain2x from "../assets/soul-link-05-10/discover-black/main-2x.png"
import discoverBlackRightRail from "../assets/soul-link-05-10/discover-black/right-rail.png"
import discoverBlackRightRail2x from "../assets/soul-link-05-10/discover-black/right-rail-2x.png"
import discoverLightMain from "../assets/soul-link-05-10/discover-light/main.png"
import discoverLightMain2x from "../assets/soul-link-05-10/discover-light/main-2x.png"
import discoverLightRightRail from "../assets/soul-link-05-10/discover-light/right-rail.png"
import discoverLightRightRail2x from "../assets/soul-link-05-10/discover-light/right-rail-2x.png"
import homeBlackMain from "../assets/soul-link-05-10/home-black/main.png"
import homeBlackMain2x from "../assets/soul-link-05-10/home-black/main-2x.png"
import homeBlackRightRail from "../assets/soul-link-05-10/home-black/right-rail.png"
import homeBlackRightRail2x from "../assets/soul-link-05-10/home-black/right-rail-2x.png"
import homeLightMain from "../assets/soul-link-05-10/home-light/main.png"
import homeLightMain2x from "../assets/soul-link-05-10/home-light/main-2x.png"
import homeLightRightRail from "../assets/soul-link-05-10/home-light/right-rail.png"
import homeLightRightRail2x from "../assets/soul-link-05-10/home-light/right-rail-2x.png"
import soulLinkUserAvatar from "../assets/npc-style-cast/portraits-hd/commission-zhideng.png"
import type { Tavern } from "../lib/taverns"

type Variant = "light" | "black"

type HomeReferenceProps = {
  variant: Variant
  featuredCitySlices: { id?: string; name?: string; description?: string; visit_count?: number; image?: string; tags?: string[] }[]
  worldPulseItems?: SoulLinkFeedItem[]
  dailyQuote?: SoulLinkDailyQuote
  onlineEntities?: SoulLinkOnlineEntity[]
  recentMemories?: SoulLinkRecentMemory[]
  guideCards?: SoulLinkGuideCard[]
  worldStats?: SoulLinkWorldStat[]
  search?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: () => void
  onToggleTheme: () => void
}

type DiscoverReferenceProps = {
  variant: Variant
  search: string
  taverns: Tavern[]
  onSearchChange: (value: string) => void
  onClear: () => void
  onTogglePlaceType: (placeTypeId: string) => void
  onToggleSpecialType: (specialTypeId: string) => void
  onToggleCategory: (label: string) => void
  onPublicOnlyChange: (value: boolean) => void
  onOpenOnlyChange: (value: boolean) => void
  sideFeedItems?: SoulLinkFeedItem[]
  onlineEntities?: SoulLinkOnlineEntity[]
  onToggleTheme: () => void
}

type Slice = {
  src: string
  src2x: string
  alt: string
  x: number
  y: number
  w: number
  h: number
}

type Artboard = {
  width: number
  height: number
  marker: string
  background: string
  slices: Slice[]
}

type Hotspot = {
  label: string
  to: string
  x: number
  y: number
  w: number
  h: number
}

type SoulLinkUserProfile = {
  name: string
  meta: string
  avatar: string
}

type SoulLinkFeedItem = {
  id: string
  title: string
  subtitle: string
  meta: string
  image: string
  to?: string
}

type SoulLinkDailyQuote = {
  title: string
  quote: string
  source?: string
}

type SoulLinkOnlineEntity = {
  id: string
  name: string
  location: string
  status: string
  avatar: string
  to?: string
}

type SoulLinkRecentMemory = {
  id: string
  title: string
  source: string
  meta: string
  image: string
  to?: string
}

type SoulLinkGuideCard = {
  id: string
  title: string
  text: string
  to?: string
  image?: string
  accent?: "violet" | "blue" | "rose" | "cyan"
}

type SoulLinkWorldStat = {
  id: string
  label: string
  value: string
}

const DEFAULT_SOUL_LINK_USER: SoulLinkUserProfile = {
  name: "星野奈奈",
  meta: "Lv.28",
  avatar: soulLinkUserAvatar,
}

const DEFAULT_DAILY_QUOTE: SoulLinkDailyQuote = {
  title: "每日一句",
  quote: "世界很大，而我们在某个坐标相遇。",
}

const DEFAULT_GUIDE_CARDS: SoulLinkGuideCard[] = [
  { id: "starter", title: "新手指南", text: "如何开始你的旅程", to: "/quests", accent: "violet" },
  { id: "worldbook", title: "坐标百科", text: "了解这个世界的规则", to: "/discover", accent: "blue" },
  { id: "safety", title: "安全指引", text: "让探索更安心", to: "/create", accent: "rose" },
]

const DEFAULT_WORLD_STATS: SoulLinkWorldStat[] = [
  { id: "coordinates", label: "新增坐标", value: "12" },
  { id: "entities", label: "在线灵魂", value: "28" },
  { id: "echoes", label: "回响记录", value: "156" },
  { id: "explores", label: "探索次数", value: "3,214" },
]

const HOME_LIGHT: Artboard = {
  width: 1536,
  height: 1024,
  marker: "home-light-real-dom-1536x1024",
  background: "#eef4ff",
  slices: [
    { src: homeLightMain, src2x: homeLightMain2x, alt: "SoulLink 首页亮色设计稿主内容切片", x: 220, y: 0, w: 1000, h: 1024 },
    { src: homeLightRightRail, src2x: homeLightRightRail2x, alt: "SoulLink 首页亮色设计稿右侧栏切片", x: 1220, y: 0, w: 316, h: 1024 },
  ],
}

const HOME_BLACK: Artboard = {
  width: 1536,
  height: 1024,
  marker: "home-black-real-dom-1536x1024",
  background: "#020710",
  slices: [
    { src: homeBlackMain, src2x: homeBlackMain2x, alt: "SoulLink 首页黑色设计稿主内容切片", x: 220, y: 0, w: 1000, h: 1024 },
    { src: homeBlackRightRail, src2x: homeBlackRightRail2x, alt: "SoulLink 首页黑色设计稿右侧栏切片", x: 1220, y: 0, w: 316, h: 1024 },
  ],
}

const DISCOVER_LIGHT: Artboard = {
  width: 1536,
  height: 1024,
  marker: "discover-light-real-dom-1536x1024",
  background: "#eef4ff",
  slices: [
    { src: discoverLightMain, src2x: discoverLightMain2x, alt: "SoulLink 探索页亮色设计稿主内容切片", x: 220, y: 0, w: 1000, h: 1024 },
    { src: discoverLightRightRail, src2x: discoverLightRightRail2x, alt: "SoulLink 探索页亮色设计稿右侧栏切片", x: 1220, y: 0, w: 316, h: 1024 },
  ],
}

const DISCOVER_BLACK: Artboard = {
  width: 1536,
  height: 1024,
  marker: "discover-black-real-dom-1536x1024",
  background: "#030712",
  slices: [
    { src: discoverBlackMain, src2x: discoverBlackMain2x, alt: "SoulLink 探索页黑色设计稿主内容切片", x: 220, y: 0, w: 1000, h: 1024 },
    { src: discoverBlackRightRail, src2x: discoverBlackRightRail2x, alt: "SoulLink 探索页黑色设计稿右侧栏切片", x: 1220, y: 0, w: 316, h: 1024 },
  ],
}

const SHARED_SIDEBAR = { x: 0, y: 0, w: 220, h: 1024 } as const
const SHARED_USER_CLUSTER = { x: 1234, y: 26, w: 286, h: 72 } as const
const HOME_RIGHT_RAIL = {
  worldPulse: { x: 1248, y: 118, w: 240, h: 316 },
  dailyQuote: { x: 1248, y: 446, w: 240, h: 108 },
  onlineEntities: { x: 1192, y: 575, w: 286, h: 238 },
} as const
const HOME_BOTTOM_RAIL = {
  recentMemories: { x: 242, y: 840, w: 350, h: 154 },
  guideCards: { x: 602, y: 840, w: 430, h: 154 },
  worldStats: { x: 1048, y: 848, w: 443, h: 144 },
} as const
const DISCOVER_RIGHT_RAIL = {
  signalFeed: { x: 1236, y: 300, w: 270, h: 250 },
  onlineEntities: { x: 1236, y: 574, w: 270, h: 260 },
} as const

const SHARED_SIDEBAR_NAV_ITEMS = [
  { id: "home", label: "首页", eyebrow: "HOME", to: "/", icon: "⌂" },
  { id: "discover", label: "探索", eyebrow: "EXPLORE", to: "/discover", icon: "◌" },
  { id: "echoes", label: "回响", eyebrow: "ECHOES", to: "/home-me", icon: "▣" },
  { id: "memory", label: "记忆", eyebrow: "MEMORY", to: "/home-me", icon: "▤" },
  { id: "saved", label: "收藏", eyebrow: "SAVED", to: "/home-me", icon: "◇" },
  { id: "anchors", label: "锚点", eyebrow: "ANCHORS", to: "/home-me", icon: "⌖" },
  { id: "create", label: "创建坐标", eyebrow: "CREATE", to: "/create", icon: "+" },
] as const

const homeSharedCardBoxes = [
  [242, 598, 218, 222],
  [472, 598, 218, 222],
  [710, 598, 218, 222],
  [940, 598, 218, 222],
] as const

const discoverSharedCardBoxes = [
  [228, 589, 224, 195],
  [467, 589, 224, 195],
  [706, 589, 224, 195],
  [945, 589, 236, 195],
  [228, 817, 224, 195],
  [467, 817, 224, 195],
  [706, 817, 224, 195],
  [945, 817, 236, 195],
] as const

// Light / black variants share the same interactive DOM layout.
// Theme differences stay in artboard slices, masks, and color classes only.
const HOME_LAYOUT = {
  cards: homeSharedCardBoxes,
  search: { x: 878, y: 41, w: 335, h: 44 },
  blackSearchMask: { x: 255, y: 14, w: 900, h: 82 },
  heroActionsMask: { x: 262, y: 304, w: 372, h: 62 },
  heroActions: {
    primary: { x: 280, y: 312, w: 136, h: 48 },
    secondary: { x: 438, y: 312, w: 176, h: 48 },
  },
  links: {
    allCoordinates: { label: "查看全部坐标", to: "/discover", x: 1070, y: 565, w: 122, h: 44 },
    memories: { label: "查看更多记忆", to: "/home-me", x: 515, y: 856, w: 82, h: 44 },
    guide: { label: "探索指南", to: "/quests", x: 603, y: 840, w: 412, h: 178 },
  },
} as const

const DISCOVER_LAYOUT = {
  cards: discoverSharedCardBoxes,
  title: { x: 228, y: 34, w: 240, h: 72 },
  search: { x: 540, y: 27, w: 426, h: 48 },
  filters: {
    all: { x: 413, y: 118, w: 72, h: 42 },
    openOnly: { x: 500, y: 118, w: 120, h: 42 },
    recent: { x: 650, y: 118, w: 120, h: 42 },
    lowSignal: { x: 782, y: 118, w: 120, h: 42 },
    cozy: { x: 916, y: 118, w: 120, h: 42 },
    more: { x: 1040, y: 118, w: 145, h: 42 },
  },
  create: { label: "创建新的坐标", to: "/create", x: 1258, y: 854, w: 260, h: 138 },
} as const

function pct(value: number, total: number) {
  return `${(value / total) * 100}%`
}

function boxStyle(artboard: Artboard, x: number, y: number, w: number, h: number): CSSProperties {
  return {
    left: pct(x, artboard.width),
    top: pct(y, artboard.height),
    width: pct(w, artboard.width),
    height: pct(h, artboard.height),
  }
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function targetFor(id?: string) {
  return id ? `/tavern/${encodeURIComponent(id)}` : "/discover"
}

function suppressMouseFocus(event: MouseEvent<HTMLElement>) {
  event.preventDefault()
}

function SoulLinkSidebar({
  artboard,
  variant,
  active,
  onToggleTheme,
}: {
  artboard: Artboard
  variant: Variant
  active: "home" | "discover"
  onToggleTheme: () => void
}) {
  const isBlack = variant === "black"
  const panelClass = isBlack
    ? "border-cyan-300/20 bg-[#020710]/96 text-cyan-50 shadow-[inset_-1px_0_0_rgba(34,211,238,0.2),0_0_34px_rgba(0,255,255,0.08)]"
    : "border-white/70 bg-white/92 text-slate-800 shadow-[24px_0_70px_rgba(104,126,190,0.16),inset_-1px_0_0_rgba(148,163,184,0.16)] backdrop-blur-xl"
  const logoMarkClass = isBlack
    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.18)]"
    : "border-violet-200 bg-violet-50 text-violet-500 shadow-[0_10px_26px_rgba(120,104,255,0.16)]"
  const logoSubClass = isBlack ? "text-cyan-100/58" : "text-slate-400"
  const inactiveClass = isBlack
    ? "text-cyan-50/58 hover:border-cyan-300/18 hover:bg-cyan-300/8 hover:text-cyan-50"
    : "text-slate-500 hover:border-violet-100 hover:bg-violet-50/70 hover:text-violet-600"
  const activeClass = isBlack
    ? "border-cyan-300/42 bg-cyan-300/16 text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.22),inset_3px_0_0_rgba(34,211,238,0.95)]"
    : "border-violet-100 bg-[#f2efff] text-violet-600 shadow-[0_12px_26px_rgba(126,111,255,0.14)]"
  const bottomControlClass = isBlack
    ? "border-cyan-300/18 bg-cyan-300/6 text-cyan-100/70 hover:text-cyan-100"
    : "border-slate-200 bg-white/72 text-slate-500 hover:text-violet-600"

  return (
    <aside
      data-soul-link-sidebar="shared"
      data-soul-link-sidebar-active={active}
      className={cx("absolute z-30 flex flex-col rounded-r-[1.45rem] border-r px-5 pb-6 pt-8", panelClass)}
      style={boxStyle(artboard, SHARED_SIDEBAR.x, SHARED_SIDEBAR.y, SHARED_SIDEBAR.w, SHARED_SIDEBAR.h)}
    >
      <Link to="/" onMouseDown={suppressMouseFocus} className="flex touch-manipulation items-center gap-3 rounded-2xl outline-none transition focus:ring-4 focus:ring-violet-400/45">
        <span className={cx("grid h-11 w-11 place-items-center rounded-2xl border text-2xl font-black", logoMarkClass)}>✦</span>
        <span className="min-w-0">
          <span className="block text-[clamp(1rem,1.25vw,1.35rem)] font-black leading-tight tracking-tight">SoulLink</span>
          <span className={cx("mt-1 block text-[clamp(0.58rem,0.68vw,0.72rem)] font-bold", logoSubClass)}>连接另一个灵魂坐标</span>
        </span>
      </Link>

      <nav aria-label="SoulLink navigation" className="mt-11 space-y-2">
        {SHARED_SIDEBAR_NAV_ITEMS.map((item) => {
          const selected = item.id === active
          return (
            <Link
              key={item.id}
              to={item.to}
              aria-current={selected ? "page" : undefined}
              onMouseDown={suppressMouseFocus}
              className={cx(
                "group flex min-h-11 touch-manipulation items-center gap-3 rounded-2xl border border-transparent px-3 py-2 text-sm font-black outline-none transition focus:ring-4 focus:ring-violet-400/45",
                selected ? activeClass : inactiveClass,
              )}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-current/20 text-base leading-none">{item.icon}</span>
              <span className="min-w-0">
                <span className="block leading-tight">{item.label}</span>
                <span className="mt-0.5 block text-[0.58rem] font-black uppercase tracking-[0.12em] opacity-55">{item.eyebrow}</span>
              </span>
            </Link>
          )
        })}
      </nav>

      <Link
        to="/create"
        data-soul-link-sidebar-cta="shared"
        onMouseDown={suppressMouseFocus}
        className={cx(
          "mt-auto rounded-3xl border p-4 text-sm font-black outline-none transition focus:ring-4 focus:ring-violet-400/45",
          isBlack
            ? "border-cyan-300/18 bg-cyan-300/6 text-cyan-50 hover:border-cyan-300/34"
            : "border-violet-100 bg-violet-50/72 text-violet-700 hover:border-violet-200",
        )}
      >
        <span className="block text-xs uppercase tracking-[0.18em] opacity-60">CREATE NODE</span>
        <span className="mt-2 flex items-center justify-between">
          创建新的坐标
          <span aria-hidden="true">↗</span>
        </span>
      </Link>

      <div className="mt-6 grid grid-cols-3 gap-3" aria-label="SoulLink sidebar actions">
        <button
          type="button"
          aria-label="切换主题"
          onClick={onToggleTheme}
          onMouseDown={suppressMouseFocus}
          className={cx("grid h-10 touch-manipulation place-items-center rounded-2xl border text-lg outline-none transition focus:ring-4 focus:ring-violet-400/45", bottomControlClass)}
        >
          ☼
        </button>
        <Link to="/home-me" aria-label="打开回响" onMouseDown={suppressMouseFocus} className={cx("grid h-10 touch-manipulation place-items-center rounded-2xl border text-lg outline-none transition focus:ring-4 focus:ring-violet-400/45", bottomControlClass)}>
          ◌
        </Link>
        <Link to="/owner" aria-label="打开事务所" onMouseDown={suppressMouseFocus} className={cx("grid h-10 touch-manipulation place-items-center rounded-2xl border text-lg outline-none transition focus:ring-4 focus:ring-violet-400/45", bottomControlClass)}>
          ⚙
        </Link>
      </div>
    </aside>
  )
}

function SoulLinkNotificationBell({ variant }: { variant: Variant }) {
  const isBlack = variant === "black"
  return (
    <button
      type="button"
      data-soul-link-notification="real-button"
      aria-label="通知中心"
      onMouseDown={suppressMouseFocus}
      className={cx(
        "relative grid h-full aspect-square shrink-0 touch-manipulation place-items-center rounded-2xl border outline-none transition focus:ring-4 focus:ring-violet-400/45",
        isBlack
          ? "border-cyan-300/18 bg-cyan-300/8 text-cyan-100 hover:border-cyan-300/35"
          : "border-slate-200/70 bg-white/82 text-slate-600 shadow-[0_10px_24px_rgba(88,106,160,0.1)] hover:text-violet-600",
      )}
    >
      <svg aria-hidden="true" className="h-[44%] w-[44%]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <span className={cx("absolute right-[18%] top-[18%] h-[22%] w-[22%] rounded-full", isBlack ? "bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.75)]" : "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]")} />
    </button>
  )
}

function SoulLinkUserAvatar({ avatar, name, variant }: { avatar: string; name: string; variant: Variant }) {
  const isBlack = variant === "black"
  return (
    <span
      data-soul-link-user-avatar="real-image"
      className={cx(
        "block h-full aspect-square shrink-0 overflow-hidden rounded-full border p-[2px]",
        isBlack ? "border-cyan-300/24 bg-cyan-300/10" : "border-violet-100 bg-violet-50",
      )}
    >
      <img src={avatar} alt={`${name} 头像`} className="h-full w-full rounded-full object-cover" loading="eager" decoding="async" />
    </span>
  )
}

function SoulLinkUserIdentity({ name, meta, variant }: { name: string; meta: string; variant: Variant }) {
  const isBlack = variant === "black"
  return (
    <span data-soul-link-user-name="real-text" className="min-w-0 flex-1 text-left">
      <span className={cx("block truncate text-[clamp(0.72rem,0.9vw,1rem)] font-black leading-tight", isBlack ? "text-cyan-50" : "text-slate-700")}>{name}</span>
      <span className={cx("mt-1 block truncate text-[clamp(0.6rem,0.72vw,0.84rem)] font-black leading-none", isBlack ? "text-cyan-100/58" : "text-slate-400")}>{meta}</span>
    </span>
  )
}

function SoulLinkUserCluster({
  artboard,
  variant,
  profile = DEFAULT_SOUL_LINK_USER,
}: {
  artboard: Artboard
  variant: Variant
  profile?: SoulLinkUserProfile
}) {
  const isBlack = variant === "black"
  return (
    <div
      data-soul-link-user-cluster="shared"
      className={cx(
        "absolute z-30 flex items-center gap-[4%] rounded-[1.75rem] border p-[0.55%] pr-[0.75%]",
        isBlack
          ? "border-cyan-300/16 bg-[#020710]/96 shadow-[0_0_30px_rgba(0,255,255,0.1)]"
          : "border-white/80 bg-white/92 shadow-[0_14px_36px_rgba(83,103,166,0.13)] backdrop-blur-xl",
      )}
      style={boxStyle(artboard, SHARED_USER_CLUSTER.x, SHARED_USER_CLUSTER.y, SHARED_USER_CLUSTER.w, SHARED_USER_CLUSTER.h)}
    >
      <SoulLinkNotificationBell variant={variant} />
      <Link
        to="/home-me"
        aria-label={`${profile.name} 个人中心`}
        onMouseDown={suppressMouseFocus}
        className="flex h-full min-w-0 flex-1 touch-manipulation items-center gap-[7%] rounded-[1.35rem] px-[2%] outline-none transition focus:ring-4 focus:ring-violet-400/45"
      >
        <SoulLinkUserAvatar avatar={profile.avatar} name={profile.name} variant={variant} />
        <SoulLinkUserIdentity name={profile.name} meta={profile.meta} variant={variant} />
        <svg aria-hidden="true" className={cx("h-[32%] w-[10%] shrink-0", isBlack ? "text-cyan-300" : "text-slate-500")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Link>
    </div>
  )
}

function fallbackFeedItemsFromHome(featuredCitySlices: HomeReferenceProps["featuredCitySlices"]): SoulLinkFeedItem[] {
  return featuredCitySlices.slice(0, 3).map((slice, index) => ({
    id: slice.id || `home-feed-${index}`,
    title: slice.name || `坐标 ${index + 1}`,
    subtitle: slice.tags?.[2] || slice.description || "新的坐标记忆正在浮现",
    meta: `${index * 3 + 2} 分钟前`,
    image: slice.image || DEFAULT_SOUL_LINK_USER.avatar,
    to: targetFor(slice.id),
  }))
}

function fallbackFeedItemsFromTaverns(taverns: Tavern[]): SoulLinkFeedItem[] {
  return taverns.slice(0, 3).map((tavern, index) => ({
    id: tavern.id || `discover-feed-${index}`,
    title: tavern.name || `坐标 ${index + 1}`,
    subtitle: tavern.description || "信号仍在波动",
    meta: `${index * 5 + 3} 分钟前`,
    image: tavern.characters?.[0]?.avatar || DEFAULT_SOUL_LINK_USER.avatar,
    to: targetFor(tavern.id),
  }))
}

function fallbackOnlineEntitiesFromFeed(items: SoulLinkFeedItem[]): SoulLinkOnlineEntity[] {
  return items.slice(0, 3).map((item, index) => ({
    id: `online-${item.id || index}`,
    name: item.title,
    location: `在 ${item.subtitle || "某个坐标"}`,
    status: index < 2 ? "在线" : `${index * 5 + 5} 分钟前`,
    avatar: item.image,
    to: item.to,
  }))
}

function fallbackRecentMemoriesFromHome(featuredCitySlices: HomeReferenceProps["featuredCitySlices"]): SoulLinkRecentMemory[] {
  const sourceItems = featuredCitySlices.length
    ? featuredCitySlices
    : [
        {
          id: "fallback-memory",
          name: "云上图书馆",
          description: "在这里，我第一次不再害怕黑夜。",
          image: soulLinkUserAvatar,
        },
      ]

  return sourceItems.slice(0, 2).map((slice, index) => ({
    id: `memory-${slice.id || index}`,
    title: `“${slice.description || (index === 0 ? "在这里，我第一次不再害怕黑夜。" : "谢谢你，陪我等到了黎明。")}”`,
    source: `来自 ${slice.name || "某个坐标"}`,
    meta: `${index * 3 + 2} 小时前`,
    image: slice.image || soulLinkUserAvatar,
    to: targetFor(slice.id),
  }))
}

function SoulLinkPanelShell({
  artboard,
  variant,
  box,
  children,
  className,
}: {
  artboard: Artboard
  variant: Variant
  box: { x: number; y: number; w: number; h: number }
  children: ReactNode
  className?: string
}) {
  const isBlack = variant === "black"
  return (
    <section
      className={cx(
        "absolute z-30 rounded-[1.55rem] border p-[1.55%]",
        isBlack
          ? "border-cyan-300/16 bg-[#020710] text-cyan-50 shadow-[0_0_28px_rgba(0,255,255,0.08)]"
          : "border-white/80 bg-white text-slate-700 shadow-[0_18px_44px_rgba(85,103,160,0.13)]",
        className,
      )}
      style={boxStyle(artboard, box.x, box.y, box.w, box.h)}
    >
      {children}
    </section>
  )
}

function SoulLinkOnlineStatus({ status, variant }: { status: string; variant: Variant }) {
  const isBlack = variant === "black"
  const isOnline = /在线|online/i.test(status)
  return (
    <span
      data-soul-link-online-status="real-text"
      className={cx(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[0.65rem] font-black leading-none",
        isOnline
          ? isBlack
            ? "bg-emerald-300/10 text-emerald-300"
            : "bg-emerald-50 text-emerald-500"
          : isBlack
            ? "bg-cyan-300/8 text-cyan-100/48"
            : "bg-slate-50 text-slate-400",
      )}
    >
      {isOnline ? <span className={cx("h-1.5 w-1.5 rounded-full", isBlack ? "bg-emerald-300" : "bg-emerald-400")} /> : null}
      {status}
    </span>
  )
}

function SoulLinkOnlineEntityRow({ entity, variant }: { entity: SoulLinkOnlineEntity; variant: Variant }) {
  const isBlack = variant === "black"
  const content = (
    <>
      <span className="relative h-11 w-11 shrink-0">
        <img
          data-soul-link-online-avatar="real-image"
          src={entity.avatar}
          alt={`${entity.name} 头像`}
          className={cx("h-11 w-11 rounded-full border object-cover", isBlack ? "border-cyan-300/18" : "border-violet-100")}
          loading="lazy"
          decoding="async"
        />
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span data-soul-link-online-name="real-text" className={cx("block truncate text-sm font-black", isBlack ? "text-cyan-50" : "text-slate-700")}>{entity.name}</span>
        <span data-soul-link-online-location="real-text" className={cx("mt-1 block truncate text-xs font-bold", isBlack ? "text-cyan-100/48" : "text-slate-400")}>{entity.location}</span>
      </span>
      <SoulLinkOnlineStatus status={entity.status} variant={variant} />
    </>
  )

  if (entity.to) {
    return (
      <Link to={entity.to} onMouseDown={suppressMouseFocus} className={cx("flex min-h-14 touch-manipulation items-center gap-3 rounded-2xl outline-none transition focus:ring-4 focus:ring-violet-400/40", isBlack ? "hover:bg-cyan-300/6" : "hover:bg-violet-50/70")}>
        {content}
      </Link>
    )
  }

  return <div className="flex min-h-14 items-center gap-3 rounded-2xl">{content}</div>
}

function SoulLinkOnlineEntitiesPanel({
  artboard,
  variant,
  box,
  entities,
}: {
  artboard: Artboard
  variant: Variant
  box: { x: number; y: number; w: number; h: number }
  entities: SoulLinkOnlineEntity[]
}) {
  const isBlack = variant === "black"
  const visibleEntities = entities.slice(0, 3)
  return (
    <SoulLinkPanelShell artboard={artboard} variant={variant} box={box} className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <span>
          <span className={cx("block text-[clamp(0.78rem,0.96vw,1.02rem)] font-black leading-tight", isBlack ? "text-cyan-50" : "text-slate-800")}>在线的灵魂</span>
          <span className={cx("mt-1 block text-[clamp(0.5rem,0.62vw,0.68rem)] font-black uppercase tracking-[0.1em]", isBlack ? "text-cyan-100/45" : "text-slate-400")}>Live Entities</span>
        </span>
        <Link to="/home-me" onMouseDown={suppressMouseFocus} className={cx("text-xs font-black outline-none transition focus:ring-4 focus:ring-violet-400/40", isBlack ? "text-cyan-300" : "text-violet-400")}>
          查看全部 →
        </Link>
      </header>
      <div data-soul-link-online-panel="real-list" className="flex flex-col divide-y divide-slate-200/60 overflow-hidden">
        {visibleEntities.length ? (
          visibleEntities.map((entity) => <SoulLinkOnlineEntityRow key={entity.id} entity={entity} variant={variant} />)
        ) : (
          <p className={cx("py-8 text-center text-sm font-bold", isBlack ? "text-cyan-100/48" : "text-slate-400")}>暂时没有在线灵魂</p>
        )}
      </div>
    </SoulLinkPanelShell>
  )
}

function SoulLinkPanelHeader({ title, eyebrow, variant }: { title: string; eyebrow?: string; variant: Variant }) {
  const isBlack = variant === "black"
  return (
    <header className="flex items-start justify-between gap-3">
      <span>
        <span className={cx("block text-[clamp(0.78rem,0.96vw,1.02rem)] font-black leading-tight", isBlack ? "text-cyan-50" : "text-slate-800")}>{title}</span>
        {eyebrow ? <span className={cx("mt-1 block text-[clamp(0.5rem,0.62vw,0.68rem)] font-black uppercase tracking-[0.1em]", isBlack ? "text-cyan-100/45" : "text-slate-400")}>{eyebrow}</span> : null}
      </span>
      <span className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-xl", isBlack ? "bg-cyan-300/10 text-cyan-300" : "bg-violet-50 text-violet-400")}>
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="10" width="2.6" height="8" rx="1.3" />
          <rect x="9" y="6" width="2.6" height="12" rx="1.3" />
          <rect x="14" y="12" width="2.6" height="6" rx="1.3" />
          <rect x="19" y="4" width="2.6" height="14" rx="1.3" />
        </svg>
      </span>
    </header>
  )
}

function SoulLinkFeedItemRow({ item, variant }: { item: SoulLinkFeedItem; variant: Variant }) {
  const isBlack = variant === "black"
  const content = (
    <>
      <img
        data-soul-link-feed-thumb="real-image"
        src={item.image}
        alt={`${item.title} 缩略图`}
        className={cx("h-11 w-11 shrink-0 rounded-full border object-cover", isBlack ? "border-cyan-300/18" : "border-violet-100")}
        loading="lazy"
        decoding="async"
      />
      <span className="min-w-0 flex-1">
        <span data-soul-link-feed-title="real-text" className={cx("block truncate text-sm font-black", isBlack ? "text-cyan-50" : "text-slate-700")}>{item.title}</span>
        <span className={cx("mt-1 block truncate text-xs font-bold", isBlack ? "text-cyan-100/48" : "text-slate-400")}>{item.subtitle}</span>
      </span>
      <span className={cx("shrink-0 text-xs font-black", isBlack ? "text-cyan-100/45" : "text-slate-400")}>{item.meta}</span>
    </>
  )

  if (item.to) {
    return (
      <Link to={item.to} onMouseDown={suppressMouseFocus} className={cx("flex min-h-14 touch-manipulation items-center gap-3 rounded-2xl outline-none transition focus:ring-4 focus:ring-violet-400/40", isBlack ? "hover:bg-cyan-300/6" : "hover:bg-violet-50/70")}>
        {content}
      </Link>
    )
  }

  return <div className="flex min-h-14 items-center gap-3 rounded-2xl">{content}</div>
}

function SoulLinkFeedPanel({
  artboard,
  variant,
  box,
  title,
  eyebrow,
  items,
  actionLabel,
  actionTo = "/discover",
}: {
  artboard: Artboard
  variant: Variant
  box: { x: number; y: number; w: number; h: number }
  title: string
  eyebrow?: string
  items: SoulLinkFeedItem[]
  actionLabel?: string
  actionTo?: string
}) {
  const isBlack = variant === "black"
  const visibleItems = items.slice(0, 3)
  return (
    <SoulLinkPanelShell artboard={artboard} variant={variant} box={box} className="flex flex-col gap-4">
      <SoulLinkPanelHeader title={title} eyebrow={eyebrow} variant={variant} />
      <div data-soul-link-feed-panel="real-list" className="flex flex-col divide-y divide-slate-200/60 overflow-hidden">
        {visibleItems.length ? (
          visibleItems.map((item) => <SoulLinkFeedItemRow key={item.id} item={item} variant={variant} />)
        ) : (
          <p className={cx("py-8 text-center text-sm font-bold", isBlack ? "text-cyan-100/48" : "text-slate-400")}>暂无新的坐标信号</p>
        )}
      </div>
      {actionLabel ? (
        <Link to={actionTo} onMouseDown={suppressMouseFocus} className={cx("mt-auto inline-flex min-h-9 touch-manipulation items-center justify-center gap-2 rounded-2xl text-sm font-black outline-none transition focus:ring-4 focus:ring-violet-400/40", isBlack ? "text-cyan-300 hover:bg-cyan-300/8" : "text-violet-500 hover:bg-violet-50")}>
          {actionLabel}
          <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </SoulLinkPanelShell>
  )
}

function SoulLinkDailyQuotePanel({
  artboard,
  variant,
  box,
  quote,
}: {
  artboard: Artboard
  variant: Variant
  box: { x: number; y: number; w: number; h: number }
  quote: SoulLinkDailyQuote
}) {
  const isBlack = variant === "black"
  return (
    <SoulLinkPanelShell artboard={artboard} variant={variant} box={box} className="overflow-hidden">
      <div data-soul-link-daily-quote="real-text" className="relative z-10">
        <p className={cx("text-sm font-black", isBlack ? "text-cyan-50" : "text-slate-800")}>{quote.title}</p>
        <blockquote className={cx("mt-4 text-[clamp(0.82rem,0.9vw,1rem)] font-bold leading-7", isBlack ? "text-cyan-100/62" : "text-slate-500")}>“{quote.quote}”</blockquote>
        {quote.source ? <p className={cx("mt-2 text-xs font-bold", isBlack ? "text-cyan-100/42" : "text-slate-400")}>— {quote.source}</p> : null}
      </div>
      <svg aria-hidden="true" className={cx("absolute bottom-2 right-3 h-16 w-16 opacity-30", isBlack ? "text-cyan-300" : "text-violet-200")} viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 51 82 18 60 82 44 57 10 51Z" />
        <path d="M44 57 82 18" />
      </svg>
    </SoulLinkPanelShell>
  )
}

function SoulLinkRecentMemoryRow({ memory, variant }: { memory: SoulLinkRecentMemory; variant: Variant }) {
  const isBlack = variant === "black"
  const content = (
    <>
      <img
        data-soul-link-memory-thumb="real-image"
        src={memory.image}
        alt={`${memory.source} 记忆缩略图`}
        className={cx("h-9 w-11 shrink-0 rounded-xl border object-cover", isBlack ? "border-cyan-300/18" : "border-slate-100")}
        loading="lazy"
        decoding="async"
      />
      <span className="min-w-0 flex-1">
        <span data-soul-link-memory-title="real-text" className={cx("block truncate text-[0.72rem] font-black leading-4", isBlack ? "text-cyan-50" : "text-slate-700")}>{memory.title}</span>
        <span data-soul-link-memory-source="real-text" className={cx("mt-0.5 block truncate text-[0.6rem] font-bold", isBlack ? "text-cyan-100/46" : "text-slate-400")}>{memory.source} · {memory.meta}</span>
      </span>
    </>
  )

  if (memory.to) {
    return (
      <Link to={memory.to} onMouseDown={suppressMouseFocus} className={cx("flex min-h-10 touch-manipulation items-center gap-2 rounded-2xl outline-none transition focus:ring-4 focus:ring-violet-400/40", isBlack ? "hover:bg-cyan-300/6" : "hover:bg-violet-50/70")}>
        {content}
      </Link>
    )
  }

  return <div className="flex min-h-10 items-center gap-2 rounded-2xl">{content}</div>
}

function SoulLinkRecentMemoriesPanel({
  artboard,
  variant,
  memories,
}: {
  artboard: Artboard
  variant: Variant
  memories: SoulLinkRecentMemory[]
}) {
  const isBlack = variant === "black"
  const visibleMemories = memories.slice(0, 2)
  return (
    <SoulLinkPanelShell artboard={artboard} variant={variant} box={HOME_BOTTOM_RAIL.recentMemories} className="flex flex-col gap-1.5 !p-3">
      <header className="flex items-center justify-between gap-3">
        <h2 className={cx("text-[0.82rem] font-black", isBlack ? "text-cyan-50" : "text-slate-800")}>最近的记忆</h2>
        <Link to="/home-me" onMouseDown={suppressMouseFocus} className={cx("text-[0.62rem] font-black outline-none transition focus:ring-4 focus:ring-violet-400/40", isBlack ? "text-cyan-300" : "text-slate-400")}>查看全部 →</Link>
      </header>
      <div data-soul-link-recent-memories="real-list" className="flex flex-col divide-y divide-slate-200/60 overflow-hidden">
        {visibleMemories.length ? (
          visibleMemories.map((memory) => <SoulLinkRecentMemoryRow key={memory.id} memory={memory} variant={variant} />)
        ) : (
          <p className={cx("py-7 text-center text-sm font-bold", isBlack ? "text-cyan-100/48" : "text-slate-400")}>暂时没有新的记忆</p>
        )}
      </div>
    </SoulLinkPanelShell>
  )
}

function guideToneClasses(accent: SoulLinkGuideCard["accent"], variant: Variant) {
  const isBlack = variant === "black"
  if (isBlack) {
    switch (accent) {
      case "rose":
        return "border-rose-300/18 bg-rose-300/8 text-rose-100"
      case "blue":
        return "border-cyan-300/18 bg-cyan-300/8 text-cyan-100"
      case "cyan":
        return "border-sky-300/18 bg-sky-300/8 text-sky-100"
      default:
        return "border-violet-300/18 bg-violet-300/8 text-violet-100"
    }
  }

  switch (accent) {
    case "rose":
      return "border-rose-100 bg-rose-50 text-rose-500"
    case "blue":
      return "border-sky-100 bg-sky-50 text-indigo-500"
    case "cyan":
      return "border-cyan-100 bg-cyan-50 text-cyan-600"
    default:
      return "border-violet-100 bg-violet-50 text-violet-500"
  }
}

function SoulLinkGuideGlyph({ accent, variant }: { accent: SoulLinkGuideCard["accent"]; variant: Variant }) {
  const isBlack = variant === "black"
  return (
    <svg
      data-soul-link-guide-image="real-svg"
      role="img"
      aria-label="探索指南图标"
      className={cx("absolute bottom-1.5 right-1.5 h-8 w-8 opacity-45", isBlack ? "text-current" : accent === "rose" ? "text-rose-300" : accent === "blue" ? "text-indigo-300" : "text-violet-300")}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 15h24l7 8v26H17z" />
      <path d="M41 15v9h8" />
      <path d="m24 38 6-6 5 5 6-9" />
      <path d="M22 48h18" />
    </svg>
  )
}

function SoulLinkGuideCardView({ card, variant }: { card: SoulLinkGuideCard; variant: Variant }) {
  const content = (
    <>
      <span data-soul-link-guide-title="real-text" className="relative z-10 block text-[0.68rem] font-black">{card.title}</span>
      <span data-soul-link-guide-text="real-text" className="relative z-10 mt-1.5 block text-[0.72rem] font-black leading-4 opacity-80">{card.text}</span>
      {card.image ? (
        <img data-soul-link-guide-image="real-image" src={card.image} alt={`${card.title} 图标`} className="absolute bottom-1.5 right-1.5 h-8 w-8 object-contain opacity-55" loading="lazy" decoding="async" />
      ) : (
        <SoulLinkGuideGlyph accent={card.accent} variant={variant} />
      )}
    </>
  )
  const className = cx("relative min-h-[4.7rem] overflow-hidden rounded-2xl border p-3 text-left outline-none transition focus:ring-4 focus:ring-violet-400/40", guideToneClasses(card.accent, variant))

  if (card.to) {
    return <Link to={card.to} onMouseDown={suppressMouseFocus} className={className}>{content}</Link>
  }

  return <div className={className}>{content}</div>
}

function SoulLinkGuidePanel({ artboard, variant, cards }: { artboard: Artboard; variant: Variant; cards: SoulLinkGuideCard[] }) {
  const isBlack = variant === "black"
  const visibleCards = cards.slice(0, 3)
  return (
    <SoulLinkPanelShell artboard={artboard} variant={variant} box={HOME_BOTTOM_RAIL.guideCards} className="flex flex-col gap-2 !p-3">
      <header className="flex items-center justify-between gap-3">
        <h2 className={cx("text-[0.82rem] font-black", isBlack ? "text-cyan-50" : "text-slate-800")}>探索指南</h2>
        <Link to="/quests" onMouseDown={suppressMouseFocus} className={cx("text-[0.62rem] font-black outline-none transition focus:ring-4 focus:ring-violet-400/40", isBlack ? "text-cyan-300" : "text-slate-400")}>查看全部 →</Link>
      </header>
      <div data-soul-link-guide-panel="real-cards" className="grid grid-cols-3 gap-3 overflow-hidden">
        {visibleCards.map((card) => <SoulLinkGuideCardView key={card.id} card={card} variant={variant} />)}
      </div>
    </SoulLinkPanelShell>
  )
}

function SoulLinkWorldStatsPanel({ artboard, variant, stats }: { artboard: Artboard; variant: Variant; stats: SoulLinkWorldStat[] }) {
  const isBlack = variant === "black"
  const visibleStats = stats.length ? stats.slice(0, 4) : DEFAULT_WORLD_STATS
  return (
    <SoulLinkPanelShell artboard={artboard} variant={variant} box={HOME_BOTTOM_RAIL.worldStats} className="overflow-hidden p-[1.25%]">
      <div data-soul-link-world-stats="real-data" className="relative z-10 flex h-full flex-col">
        <header className="flex items-center gap-1.5">
          <h2 className={cx("text-[0.9rem] font-black", isBlack ? "text-cyan-50" : "text-slate-800")}>今日世界统计</h2>
          <span className={cx("grid h-4 w-4 place-items-center rounded-full border text-[0.62rem] font-black", isBlack ? "border-cyan-300/25 text-cyan-100/56" : "border-slate-300 text-slate-400")}>i</span>
        </header>
        <div className="mt-auto grid grid-cols-4 divide-x divide-slate-200/70">
          {visibleStats.map((stat) => (
            <div key={stat.id} className="px-3 text-center first:pl-0 last:pr-0">
              <p data-soul-link-world-stat-value="real-text" className={cx("text-[clamp(1rem,1.35vw,1.45rem)] font-black leading-tight", isBlack ? "text-cyan-200" : "text-violet-500")}>{stat.value}</p>
              <p data-soul-link-world-stat-label="real-text" className={cx("mt-2 truncate text-[0.72rem] font-black", isBlack ? "text-cyan-100/46" : "text-slate-500")}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <svg data-soul-link-world-stats-deco="real-svg" aria-hidden="true" className={cx("absolute right-7 top-3 h-20 w-20 opacity-25", isBlack ? "text-cyan-300" : "text-violet-200")} viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 51 82 18 60 82 44 57 10 51Z" />
        <path d="M44 57 82 18" />
        <path d="M24 70c5-7 12-10 20-9" strokeDasharray="4 6" />
      </svg>
    </SoulLinkPanelShell>
  )
}

function ArtboardShell({ artboard, variant, kind, children }: { artboard: Artboard; variant: Variant; kind: "home" | "discover"; children: ReactNode }) {
  return (
    <main
      data-soul-link-real-dom="true"
      data-soul-link-variant={variant}
      className="min-h-screen overflow-x-hidden"
      style={{ background: artboard.background }}
    >
      <section
        data-soul-link-reference={artboard.marker}
        data-soul-link-dom={kind}
        data-soul-link-design-lock="owner-reference-1-to-1"
        className="relative mx-auto w-full select-none overflow-hidden"
        style={{ maxWidth: `${artboard.width}px`, aspectRatio: `${artboard.width} / ${artboard.height}`, background: artboard.background }}
      >
        {artboard.slices.map((slice) => (
          <img
            key={slice.alt}
            src={slice.src}
            srcSet={`${slice.src} 1x, ${slice.src2x} 2x`}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="absolute block h-full w-full object-fill"
            style={boxStyle(artboard, slice.x, slice.y, slice.w, slice.h)}
          />
        ))}
        {children}
      </section>
    </main>
  )
}

function OverlayLink({ artboard, hotspot, className }: { artboard: Artboard; hotspot: Hotspot; className?: string }) {
  return (
    <Link
      to={hotspot.to}
      aria-label={hotspot.label}
      title={hotspot.label}
      onMouseDown={suppressMouseFocus}
      className={cx(
        "absolute z-10 min-h-11 touch-manipulation rounded-xl opacity-0 outline-none transition focus:opacity-100 focus:ring-4 focus:ring-violet-400/70",
        className,
      )}
      style={boxStyle(artboard, hotspot.x, hotspot.y, hotspot.w, hotspot.h)}
    />
  )
}

function OverlayButton({ artboard, label, onClick, x, y, w, h }: { artboard: Artboard; label: string; onClick: () => void; x: number; y: number; w: number; h: number }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      onMouseDown={suppressMouseFocus}
      className="absolute z-10 min-h-11 touch-manipulation rounded-full opacity-0 outline-none transition focus:opacity-100 focus:ring-4 focus:ring-violet-400/70"
      style={boxStyle(artboard, x, y, w, h)}
    />
  )
}

function OverlayText({ artboard, children, x, y, w, h }: { artboard: Artboard; children: ReactNode; x: number; y: number; w: number; h: number }) {
  return (
    <span className="pointer-events-none absolute z-10 opacity-0" style={boxStyle(artboard, x, y, w, h)}>
      {children}
    </span>
  )
}

function OverlayMask({ artboard, className, x, y, w, h }: { artboard: Artboard; className: string; x: number; y: number; w: number; h: number }) {
  return <span aria-hidden="true" className={cx("pointer-events-none absolute z-[12]", className)} style={boxStyle(artboard, x, y, w, h)} />
}

function OverlayInput({
  artboard,
  value,
  onChange,
  onSubmit,
  placeholder,
  variant = "light",
  x,
  y,
  w,
  h,
}: {
  artboard: Artboard
  value: string
  onChange?: (value: string) => void
  onSubmit?: () => void
  placeholder: string
  variant?: Variant
  x: number
  y: number
  w: number
  h: number
}) {
  const shellToneClass =
    variant === "black"
      ? "border-cyan-300/28 bg-[#061226] text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.14),inset_0_0_0_1px_rgba(103,232,249,0.1)]"
      : "border-white/70 bg-white text-[#99a4d3] shadow-[0_10px_28px_rgba(74,98,176,0.12),inset_0_0_0_1px_rgba(255,255,255,0.78)]"
  const inputToneClass =
    variant === "black"
      ? "text-cyan-50 caret-cyan-300 placeholder:text-cyan-100/52 focus:placeholder:text-cyan-100/40"
      : "text-slate-900 caret-violet-500 placeholder:text-slate-400/90 focus:placeholder:text-slate-400/70"
  const keyToneClass =
    variant === "black"
      ? "border-cyan-300/16 bg-cyan-100/8 text-cyan-100/70"
      : "bg-slate-100/80 text-slate-400"

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || !onSubmit) return
    event.preventDefault()
    onSubmit()
  }

  return (
    <label
      data-soul-link-search={onChange ? "real-input" : undefined}
      className={cx("absolute z-20 flex min-h-11 cursor-text touch-manipulation items-center rounded-full border transition focus-within:ring-2", shellToneClass)}
      style={boxStyle(artboard, x, y, w, h)}
    >
      <span className="sr-only">搜索地点、角色、记忆或关键词</span>
      <svg aria-hidden="true" className="pointer-events-none absolute left-[7.5%] h-[42%] w-[8%]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m16.5 16.5 4 4" />
      </svg>
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={handleKeyDown}
        readOnly={!onChange}
        placeholder={placeholder}
        className={cx(
          "h-full min-h-11 w-full rounded-full border-0 bg-transparent py-0 pl-[18%] pr-[18%] text-sm font-semibold outline-none transition",
          inputToneClass,
        )}
      />
      <span aria-hidden="true" className={cx("pointer-events-none absolute right-[7%] grid h-[48%] min-h-5 w-[7%] min-w-5 place-items-center rounded-lg text-sm font-black leading-none", keyToneClass)}>
        /
      </span>
    </label>
  )
}

function HomeHeroActions({ artboard, variant }: { artboard: Artboard; variant: Variant }) {
  const isBlack = variant === "black"
  const primaryClass = isBlack
    ? "border-cyan-200/50 bg-cyan-300 text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.28)]"
    : "border-violet-300/45 bg-[#8e83ff] text-white shadow-[0_14px_28px_rgba(126,111,255,0.22)]"
  const secondaryClass = isBlack
    ? "border-cyan-300/35 bg-[#061226]/88 text-cyan-50 shadow-[0_0_18px_rgba(34,211,238,0.12)]"
    : "border-slate-300/60 bg-white/86 text-slate-700 shadow-[0_10px_24px_rgba(74,98,176,0.1)]"

  return (
    <>
      <Link
        to="/discover"
        aria-label="开始探索"
        onMouseDown={suppressMouseFocus}
        className={cx("absolute z-20 flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-[1.15rem] border text-sm font-black transition hover:-translate-y-0.5 focus:outline-none focus:ring-4", primaryClass)}
        style={boxStyle(artboard, HOME_LAYOUT.heroActions.primary.x, HOME_LAYOUT.heroActions.primary.y, HOME_LAYOUT.heroActions.primary.w, HOME_LAYOUT.heroActions.primary.h)}
      >
        <span>开始探索</span>
        <span aria-hidden="true">↗</span>
      </Link>
      <Link
        to="/discover"
        aria-label="观看世界介绍"
        onMouseDown={suppressMouseFocus}
        className={cx("absolute z-20 flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-[1.15rem] border text-sm font-black transition hover:-translate-y-0.5 focus:outline-none focus:ring-4", secondaryClass)}
        style={boxStyle(artboard, HOME_LAYOUT.heroActions.secondary.x, HOME_LAYOUT.heroActions.secondary.y, HOME_LAYOUT.heroActions.secondary.w, HOME_LAYOUT.heroActions.secondary.h)}
      >
        <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-full border border-current/35 text-xs">▶</span>
        <span>观看世界介绍</span>
      </Link>
    </>
  )
}

function HomeCardLinks({ artboard, featuredCitySlices }: { artboard: Artboard; featuredCitySlices: HomeReferenceProps["featuredCitySlices"] }) {
  return (
    <>
      {HOME_LAYOUT.cards.map(([x, y, w, h], index) => (
        <OverlayLink
          key={`home-card-${index}`}
          artboard={artboard}
          hotspot={{ label: `进入推荐坐标 ${featuredCitySlices[index]?.name || index + 1}`, to: targetFor(featuredCitySlices[index]?.id), x, y, w, h }}
        />
      ))}
    </>
  )
}

function DiscoverCardLinks({ artboard, taverns }: { artboard: Artboard; taverns: Tavern[] }) {
  return (
    <>
      {DISCOVER_LAYOUT.cards.map(([x, y, w, h], index) => (
        <OverlayLink
          key={`discover-card-${index}`}
          artboard={artboard}
          hotspot={{ label: `进入探索坐标 ${taverns[index]?.name || index + 1}`, to: targetFor(taverns[index]?.id), x, y, w, h }}
        />
      ))}
    </>
  )
}

export function SoulLinkHomeReference({
  variant,
  featuredCitySlices,
  worldPulseItems,
  dailyQuote = DEFAULT_DAILY_QUOTE,
  onlineEntities,
  recentMemories,
  guideCards = DEFAULT_GUIDE_CARDS,
  worldStats = DEFAULT_WORLD_STATS,
  search,
  onSearchChange,
  onSearchSubmit,
  onToggleTheme,
}: HomeReferenceProps) {
  const artboard = variant === "black" ? HOME_BLACK : HOME_LIGHT
  const resolvedWorldPulseItems = worldPulseItems?.length ? worldPulseItems : fallbackFeedItemsFromHome(featuredCitySlices)
  const resolvedOnlineEntities = onlineEntities?.length ? onlineEntities : fallbackOnlineEntitiesFromFeed(resolvedWorldPulseItems)
  const resolvedRecentMemories = recentMemories?.length ? recentMemories : fallbackRecentMemoriesFromHome(featuredCitySlices)
  return (
    <ArtboardShell artboard={artboard} variant={variant} kind="home">
      <SoulLinkSidebar artboard={artboard} variant={variant} active="home" onToggleTheme={onToggleTheme} />
      <SoulLinkUserCluster artboard={artboard} variant={variant} />
      <SoulLinkFeedPanel
        artboard={artboard}
        variant={variant}
        box={HOME_RIGHT_RAIL.worldPulse}
        title="世界脉搏"
        eyebrow="实时回响"
        items={resolvedWorldPulseItems}
        actionLabel="查看全部动态"
      />
      <SoulLinkDailyQuotePanel artboard={artboard} variant={variant} box={HOME_RIGHT_RAIL.dailyQuote} quote={dailyQuote} />
      <SoulLinkOnlineEntitiesPanel artboard={artboard} variant={variant} box={HOME_RIGHT_RAIL.onlineEntities} entities={resolvedOnlineEntities} />
      <SoulLinkRecentMemoriesPanel artboard={artboard} variant={variant} memories={resolvedRecentMemories} />
      <SoulLinkGuidePanel artboard={artboard} variant={variant} cards={guideCards} />
      <SoulLinkWorldStatsPanel artboard={artboard} variant={variant} stats={worldStats} />
      <OverlayText artboard={artboard} x={270} y={135} w={480} h={120}>
        {variant === "black" ? "接入仍在回应的数字坐标网络" : "在每一个坐标里，遇见另一种可能的自己。"}
      </OverlayText>
      {variant === "black" ? <OverlayMask artboard={artboard} className="rounded-[1.4rem] bg-[#02070e] shadow-[0_0_34px_rgba(2,7,14,0.92)]" {...HOME_LAYOUT.blackSearchMask} /> : null}
      <OverlayInput
        artboard={artboard}
        value={search || ""}
        onChange={onSearchChange}
        onSubmit={onSearchSubmit}
        placeholder="输入你想前往的地方..."
        variant={variant}
        {...HOME_LAYOUT.search}
      />
      <OverlayMask artboard={artboard} className={variant === "black" ? "rounded-[1.25rem] bg-[#08101a]/92" : "rounded-[1.25rem] bg-white/45 backdrop-blur-[2px]"} {...HOME_LAYOUT.heroActionsMask} />
      <HomeHeroActions artboard={artboard} variant={variant} />
      <HomeCardLinks artboard={artboard} featuredCitySlices={featuredCitySlices} />
      <OverlayLink artboard={artboard} hotspot={HOME_LAYOUT.links.allCoordinates} />
    </ArtboardShell>
  )
}

export function SoulLinkDiscoverReference(props: DiscoverReferenceProps) {
  const artboard = props.variant === "black" ? DISCOVER_BLACK : DISCOVER_LIGHT
  const resolvedSideFeedItems = props.sideFeedItems?.length ? props.sideFeedItems : fallbackFeedItemsFromTaverns(props.taverns)
  const resolvedOnlineEntities = props.onlineEntities?.length ? props.onlineEntities : fallbackOnlineEntitiesFromFeed(resolvedSideFeedItems)
  return (
    <ArtboardShell artboard={artboard} variant={props.variant} kind="discover">
      <SoulLinkSidebar artboard={artboard} variant={props.variant} active="discover" onToggleTheme={props.onToggleTheme} />
      <SoulLinkUserCluster artboard={artboard} variant={props.variant} />
      <SoulLinkFeedPanel
        artboard={artboard}
        variant={props.variant}
        box={DISCOVER_RIGHT_RAIL.signalFeed}
        title="信号动态"
        eyebrow="Signal Feed"
        items={resolvedSideFeedItems}
        actionLabel="查看全部"
      />
      <SoulLinkOnlineEntitiesPanel artboard={artboard} variant={props.variant} box={DISCOVER_RIGHT_RAIL.onlineEntities} entities={resolvedOnlineEntities} />
      <OverlayText artboard={artboard} {...DISCOVER_LAYOUT.title}>
        探索
      </OverlayText>
      <OverlayInput
        artboard={artboard}
        value={props.search}
        onChange={props.onSearchChange}
        placeholder="搜索地点、角色、记忆或关键词..."
        variant={props.variant}
        {...DISCOVER_LAYOUT.search}
      />
      <OverlayButton artboard={artboard} label="全部筛选" onClick={props.onClear} {...DISCOVER_LAYOUT.filters.all} />
      <OverlayButton artboard={artboard} label="正在被探索" onClick={() => props.onOpenOnlyChange(true)} {...DISCOVER_LAYOUT.filters.openOnly} />
      <OverlayButton artboard={artboard} label="最近活跃" onClick={() => props.onPublicOnlyChange(true)} {...DISCOVER_LAYOUT.filters.recent} />
      <OverlayButton artboard={artboard} label="低信号" onClick={() => props.onToggleSpecialType("cultivation-retreat")} {...DISCOVER_LAYOUT.filters.lowSignal} />
      <OverlayButton artboard={artboard} label="舒适空间" onClick={() => props.onTogglePlaceType("bookstore")} {...DISCOVER_LAYOUT.filters.cozy} />
      <OverlayButton artboard={artboard} label="更多筛选" onClick={() => props.onToggleCategory("陪伴树洞")} {...DISCOVER_LAYOUT.filters.more} />
      <DiscoverCardLinks artboard={artboard} taverns={props.taverns} />
      <OverlayLink artboard={artboard} hotspot={DISCOVER_LAYOUT.create} />
    </ArtboardShell>
  )
}

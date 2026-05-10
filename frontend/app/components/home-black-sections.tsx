import { ArrowRight } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router"

import homeBlackFeaturedCover01 from "../assets/homepage/black/elements/home-black-featured-cover-01.png"
import homeBlackFeaturedCover012x from "../assets/homepage/black/elements/home-black-featured-cover-01-2x.png"
import homeBlackFeaturedCover02 from "../assets/homepage/black/elements/home-black-featured-cover-02.png"
import homeBlackFeaturedCover022x from "../assets/homepage/black/elements/home-black-featured-cover-02-2x.png"
import homeBlackFeaturedCover03 from "../assets/homepage/black/elements/home-black-featured-cover-03.png"
import homeBlackFeaturedCover032x from "../assets/homepage/black/elements/home-black-featured-cover-03-2x.png"
import homeBlackCtaCity from "../assets/homepage/black/elements/home-black-cta-city.png"
import homeBlackCtaCity2x from "../assets/homepage/black/elements/home-black-cta-city-2x.png"
import homeBlackSliceNavBar from "../assets/homepage/black/slices/home-black-slice-01a-nav-bar.png"
import homeBlackSliceNavBar2x from "../assets/homepage/black/slices/home-black-slice-01a-nav-bar-2x.png"
import homeBlackSliceHeroMain from "../assets/homepage/black/slices/home-black-slice-01b-hero-main.png"
import homeBlackSliceHeroMain2x from "../assets/homepage/black/slices/home-black-slice-01b-hero-main-2x.png"
import homeBlackSectionBunny from "../assets/homepage/black/elements/home-black-section-bunny.png"
import homeBlackSectionBunny2x from "../assets/homepage/black/elements/home-black-section-bunny-2x.png"
import rolePortrait01 from "../assets/homepage/light/elements/home-light-role-portrait-01.png"
import rolePortrait012x from "../assets/homepage/light/elements/home-light-role-portrait-01-2x.png"
import rolePortrait02 from "../assets/homepage/light/elements/home-light-role-portrait-02.png"
import rolePortrait022x from "../assets/homepage/light/elements/home-light-role-portrait-02-2x.png"
import rolePortrait03 from "../assets/homepage/light/elements/home-light-role-portrait-03.png"
import rolePortrait032x from "../assets/homepage/light/elements/home-light-role-portrait-03-2x.png"
import rolePortrait04 from "../assets/homepage/light/elements/home-light-role-portrait-04.png"
import rolePortrait042x from "../assets/homepage/light/elements/home-light-role-portrait-04-2x.png"
import {
  HOME_BLACK_ARTBOARD,
  HOME_BLACK_SECTIONS,
  HOME_LIGHT_ARTBOARD,
  HOME_LIGHT_SECTIONS,
  referenceLocalStyle,
  referenceSectionStyle,
  type HomeReferenceSection,
  type HomeReferenceSectionId,
} from "./home-reference-layout"

type CardImage = {
  image: string
  image2x: string
}

const ARTBOARD_WIDTH = HOME_BLACK_ARTBOARD.width
const ARTBOARD_HEIGHT = HOME_BLACK_ARTBOARD.height
const NAV_HEIGHT = HOME_BLACK_ARTBOARD.navHeight
const BODY_HEIGHT = ARTBOARD_HEIGHT - NAV_HEIGHT
const BODY_SECTION_COUNT = 6
const TOTAL_SECTION_COUNT = 1 + BODY_SECTION_COUNT
const TOTAL_RUNTIME_SLICE_COUNT = 2

const navBacking = {
  id: "black-01a-nav-bar",
  label: "FableMap 黑色赛博主题首页顶部导航栏",
  src: homeBlackSliceNavBar,
  src2x: homeBlackSliceNavBar2x,
  width: ARTBOARD_WIDTH,
  height: NAV_HEIGHT,
} as const

export const HOME_BLACK_NAV_BACKING = navBacking
export const HOME_BLACK_ARTBOARD_WIDTH = ARTBOARD_WIDTH
export const HOME_BLACK_BODY_HEIGHT = BODY_HEIGHT
export const HOME_BLACK_TOTAL_SECTION_COUNT = TOTAL_SECTION_COUNT
export const HOME_BLACK_RUNTIME_SLICE_COUNT = TOTAL_RUNTIME_SLICE_COUNT

const sections: HomeReferenceSection[] = HOME_BLACK_SECTIONS

const featuredCards = [
  { title: "第三货架秘密社", meta: "FableMap 锚点 · 24h Convenience Corner", chips: ["可进入", "4 位 NPC", "3 次到访"], image: homeBlackFeaturedCover01, image2x: homeBlackFeaturedCover012x },
  { title: "小灯塔问路铺", meta: "FableMap 锚点 · Shibuya Crossing", chips: ["可进入", "3 位 NPC", "24 次到访"], image: homeBlackFeaturedCover02, image2x: homeBlackFeaturedCover022x },
  { title: "月亮不睡电台", meta: "FableMap 锚点 · Night Radio Booth", chips: ["可进入", "3 位 NPC", "2 次到访"], image: homeBlackFeaturedCover03, image2x: homeBlackFeaturedCover032x },
] as const

const roleCards = [
  { name: "艾拉", role: "信号强烈", quote: "如果你迷路了，坐标会回应。", badge: "在线", image: rolePortrait01, image2x: rolePortrait012x },
  { name: "零", role: "信号稳定", quote: "我会记录每一次回访。", badge: "可对话", image: rolePortrait02, image2x: rolePortrait022x },
  { name: "柯恩", role: "信号活跃", quote: "城市的暗光里藏着线索。", badge: "可对话", image: rolePortrait03, image2x: rolePortrait032x },
  { name: "璃音", role: "信号活跃", quote: "记忆像霓虹，会再次亮起。", badge: "呼叫", image: rolePortrait04, image2x: rolePortrait042x },
] as const

const memoryCards = [
  { title: "雨夜便利店的对话", text: "货架尽头的信号，像是世界在低声回应。", from: "艾拉", date: "23:11", image: homeBlackFeaturedCover01, image2x: homeBlackFeaturedCover012x },
  { title: "消失的广告牌", text: "旧街角闪过一行字，又被雨幕吞没。", from: "零", date: "昨天", image: homeBlackFeaturedCover02, image2x: homeBlackFeaturedCover022x },
  { title: "她留下的旋律", text: "坐标同步后，电台里传来熟悉旋律。", from: "璃音", date: "2 天前", image: homeBlackFeaturedCover03, image2x: homeBlackFeaturedCover032x },
  { title: "天台上的风", text: "蓝色扫描线穿过夜色，带回新的回访。", from: "柯恩", date: "3 天前", image: homeBlackFeaturedCover01, image2x: homeBlackFeaturedCover012x },
] as const

const recommendedCards = [
  { title: "云湖数据馆", meta: "FableMap 锚点 · Sky Data Library", chips: ["可进入", "5 位 NPC", "18 次到访"], image: homeBlackFeaturedCover01, image2x: homeBlackFeaturedCover012x },
  { title: "风之中继塔", meta: "FableMap 锚点 · Wind Relay Tower", chips: ["可进入", "2 位 NPC", "11 次到访"], image: homeBlackFeaturedCover02, image2x: homeBlackFeaturedCover022x },
  { title: "樱花信标站", meta: "FableMap 锚点 · Sakura Beacon", chips: ["可进入", "3 位 NPC", "27 次到访"], image: homeBlackFeaturedCover03, image2x: homeBlackFeaturedCover032x },
] as const

const footerGroups = [
  { title: "探索", items: ["附近坐标", "区域推荐", "特色活动"] },
  { title: "角色", items: ["AI 角色", "角色图鉴", "相遇记录"] },
  { title: "记忆", items: ["记忆回响", "我的收藏", "时间线"] },
  { title: "创建", items: ["创建空间", "空间管理", "使用指南"] },
  { title: "支持", items: ["帮助中心", "反馈建议", "隐私政策"] },
] as const

function sectionById(id: HomeReferenceSectionId) {
  const section = sections.find((candidate) => candidate.id === id)
  if (!section) throw new Error(`Unknown home black section: ${id}`)
  return section
}

function lightSectionById(id: HomeReferenceSectionId) {
  const section = HOME_LIGHT_SECTIONS.find((candidate) => candidate.id === id)
  if (!section) throw new Error(`Unknown home light section: ${id}`)
  return section
}

function sectionStyle(section: HomeReferenceSection) {
  return referenceSectionStyle(section, BODY_HEIGHT)
}

function localStyle(section: HomeReferenceSection, left: number, top: number, width: number, height: number) {
  return referenceLocalStyle(ARTBOARD_WIDTH, section, left, top, width, height)
}

function scaleLightX(value: number) {
  return (value / HOME_LIGHT_ARTBOARD.width) * ARTBOARD_WIDTH
}

function scaleLightSectionY(section: HomeReferenceSection, value: number) {
  const sourceSection = lightSectionById(section.id)
  return (value / sourceSection.height) * section.height
}

function localStyleFromLight(section: HomeReferenceSection, left: number, top: number, width: number, height: number) {
  return localStyle(
    section,
    scaleLightX(left),
    scaleLightSectionY(section, top),
    scaleLightX(width),
    scaleLightSectionY(section, height),
  )
}

function srcSet(image: CardImage) {
  return `${image.image} 1x, ${image.image2x} 2x`
}

function SectionShell({ section, children, mode = "real-dom-replacement" }: { section: HomeReferenceSection; children: ReactNode; mode?: "real-dom-replacement" | "image-backed-reference" }) {
  return (
    <section
      data-home-black-section={section.id}
      data-home-black-section-boundary="real-page-section"
      data-home-black-section-dom={mode}
      data-home-black-section-hotspots="owned"
      data-home-shared-template-section={section.id}
      data-home-layout-source="home-light-scaled"
      className="absolute overflow-hidden"
      style={sectionStyle(section)}
      aria-label={section.label}
    >
      {children}
    </section>
  )
}

function NeonChip({ children }: { children: ReactNode }) {
  return <span className="rounded-md border border-cyan-300/35 bg-cyan-300/10 px-2 py-0.5 text-[clamp(5px,0.72vw,9px)] font-black text-cyan-100">{children}</span>
}

function BlackSectionFrame() {
  return <div className="pointer-events-none absolute inset-x-[1.35%] inset-y-[2.2%] rounded-[1rem] border border-cyan-300/16 shadow-[inset_0_0_28px_rgba(34,211,238,0.055),0_0_22px_rgba(217,70,239,0.045)]" />
}

function BlackSectionHeading({ section, eyebrow, title, ctaLabel, ctaTo, top = 24 }: { section: HomeReferenceSection; eyebrow: string; title: string; ctaLabel: string; ctaTo: string; top?: number }) {
  return (
    <>
      <div className="absolute" style={localStyleFromLight(section, 65, top, 430, 48)}>
        <p className="text-[clamp(5px,0.92vw,10px)] font-black tracking-[0.14em] text-cyan-200">✦ {eyebrow}</p>
        <h2 className="mt-1 text-[clamp(13px,2.45vw,27px)] font-black leading-none tracking-[-0.02em] text-cyan-50 drop-shadow-[0_0_14px_rgba(34,211,238,0.28)]">{title}</h2>
      </div>
      <Link data-home-black-hotspot={ctaLabel} data-home-black-section-hotspot={section.id} to={ctaTo} aria-label={ctaLabel} className="absolute inline-flex items-center justify-end gap-1 text-[clamp(5px,0.88vw,10px)] font-black text-cyan-100/86" style={localStyleFromLight(section, 775, top + 12, 105, 22)}>
        {ctaLabel} <ArrowRight className="h-[1em] w-[1em]" />
      </Link>
    </>
  )
}

export function HomeBlackHeroSection() {
  const section = sectionById("hero")
  return (
    <SectionShell section={section} mode="image-backed-reference">
      <img
        data-home-black-slice="01b-hero-main"
        src={homeBlackSliceHeroMain}
        srcSet={`${homeBlackSliceHeroMain} 1x, ${homeBlackSliceHeroMain2x} 2x`}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full select-none object-cover"
        decoding="async"
        fetchPriority="high"
        draggable={false}
      />
      <Link data-home-black-hotspot="开始探索真实坐标" data-home-black-section-hotspot="hero" to="/discover" aria-label="开始探索真实坐标" className="absolute rounded-full border-0 bg-transparent text-transparent outline-none transition focus-visible:ring-4 focus-visible:ring-cyan-300/70" style={localStyleFromLight(section, 55, 168, 105, 34)}>开始探索</Link>
      <Link data-home-black-hotspot="创建我的空间" data-home-black-section-hotspot="hero" to="/create" aria-label="创建我的空间" className="absolute rounded-full border-0 bg-transparent text-transparent outline-none transition focus-visible:ring-4 focus-visible:ring-cyan-300/70" style={localStyleFromLight(section, 170, 168, 126, 34)}>创建我的空间</Link>
      <Link data-home-black-hotspot="探索真实坐标" data-home-black-section-hotspot="hero" to="/discover" aria-label="探索真实坐标" className="absolute rounded-full border-0 bg-transparent text-transparent outline-none transition focus-visible:ring-4 focus-visible:ring-cyan-300/70" style={localStyleFromLight(section, 746, 316, 176, 37)}>探索真实坐标</Link>
    </SectionShell>
  )
}

export function HomeBlackFeaturedSection({ targets }: { targets: string[] }) {
  const section = sectionById("featured-regions")
  return (
    <SectionShell section={section}>
      <div className="absolute inset-0 bg-[#050b19]" />
      <BlackSectionFrame />
      <BlackSectionHeading section={section} eyebrow="正在发光的区域" title="从地图进入未被看见的世界" ctaLabel="查看全部发光区域" ctaTo="/discover" top={22} />
      <img src={homeBlackSectionBunny} srcSet={`${homeBlackSectionBunny} 1x, ${homeBlackSectionBunny2x} 2x`} alt="" aria-hidden="true" className="pointer-events-none absolute select-none object-contain drop-shadow-[0_0_18px_rgba(34,211,238,0.18)]" style={localStyleFromLight(section, 854, 30, 64, 61)} decoding="async" draggable={false} />
      {featuredCards.map((card, index) => (
        <Link key={card.title} data-home-black-hotspot={`进入第${index + 1}个发光区域`} data-home-black-section-hotspot="featured-regions" to={targets[index] || "/discover"} aria-label={["进入第一个发光区域", "进入第二个发光区域", "进入第三个发光区域"][index]} className="absolute overflow-hidden rounded-[1.15rem] border border-cyan-300/30 bg-[#06101f] shadow-[0_0_30px_rgba(0,214,255,0.12)] transition hover:-translate-y-1" style={localStyleFromLight(section, 65 + index * 284, 82, 270, 185)}>
          <img src={card.image} srcSet={srcSet(card)} alt="" aria-hidden="true" className="h-[60.5%] w-full object-cover" decoding="async" draggable={false} />
          <div className="px-4 py-2">
            <h3 className="text-[clamp(8px,1.26vw,14px)] font-black text-cyan-50">{card.title}</h3>
            <p className="mt-1 truncate text-[clamp(5px,0.82vw,9px)] font-semibold text-cyan-100/66">{card.meta}</p>
            <div className="mt-2 flex gap-1.5">{card.chips.map((chip) => <NeonChip key={chip}>{chip}</NeonChip>)}</div>
          </div>
        </Link>
      ))}
    </SectionShell>
  )
}

export function HomeBlackRoleSection() {
  const section = sectionById("ai-roles")
  return (
    <SectionShell section={section}>
      <div className="absolute inset-0 bg-[#050b19]" />
      <BlackSectionFrame />
      <BlackSectionHeading section={section} eyebrow="AI 角色相遇" title="他们在巷处，等着与你相遇" ctaLabel="查看全部角色" ctaTo="/discover" top={20} />
      {roleCards.map((role, index) => (
        <Link key={role.name} data-home-black-hotspot={`和第${index + 1}个 AI 角色对话`} data-home-black-section-hotspot="ai-roles" to="/discover" aria-label={["和第一个 AI 角色对话", "和第二个 AI 角色对话", "和第三个 AI 角色对话", "和第四个 AI 角色对话"][index]} className="absolute overflow-hidden rounded-[1rem] border border-cyan-300/28 bg-[#06101f]/95 shadow-[0_0_26px_rgba(34,211,238,0.10)] transition hover:-translate-y-1" style={localStyleFromLight(section, 65 + index * 215, 68, 205, 92)}>
          <img src={role.image} srcSet={srcSet(role)} alt="" aria-hidden="true" className="absolute left-3 top-1/2 h-[72%] w-[34%] -translate-y-1/2 rounded-full border border-cyan-300/35 bg-[#071226] object-cover shadow-[0_0_16px_rgba(34,211,238,0.12)]" decoding="async" draggable={false} />
          <div className="absolute left-[43%] right-3 top-3">
            <h3 className="text-[clamp(7px,1.05vw,12px)] font-black text-cyan-50">{role.name}</h3>
            <p className="text-[clamp(5px,0.76vw,9px)] font-bold text-cyan-100/62">{role.role}</p>
            <p className="mt-2 line-clamp-2 text-[clamp(5px,0.75vw,8.5px)] font-semibold leading-[1.35] text-cyan-100/58">“{role.quote}”</p>
          </div>
          <span className="absolute bottom-2 right-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 text-[clamp(5px,0.72vw,8px)] font-black text-cyan-100">{role.badge}</span>
        </Link>
      ))}
    </SectionShell>
  )
}

export function HomeBlackMemorySection() {
  const section = sectionById("memory-echoes")
  return (
    <SectionShell section={section}>
      <div className="absolute inset-0 bg-[#050b19]" />
      <BlackSectionFrame />
      <BlackSectionHeading section={section} eyebrow="记忆回响" title="被时间温柔收藏的片段" ctaLabel="查看更多记忆" ctaTo="/home-me" top={20} />
      {memoryCards.map((memory, index) => (
        <Link key={memory.title} data-home-black-hotspot={`打开第${index + 1}段记忆回响`} data-home-black-section-hotspot="memory-echoes" to="/home-me" aria-label={["打开第一段记忆回响", "打开第二段记忆回响", "打开第三段记忆回响", "打开第四段记忆回响"][index]} className="absolute overflow-hidden rounded-[0.9rem] border border-cyan-300/24 bg-[#06101f]/95 shadow-[0_0_24px_rgba(34,211,238,0.09)] transition hover:-translate-y-1" style={localStyleFromLight(section, 65 + index * 212, 64, 190, 92)}>
          <img src={memory.image} srcSet={srcSet(memory)} alt="" aria-hidden="true" className="absolute left-2 top-2 h-[76px] w-[70px] rounded-lg object-cover" decoding="async" draggable={false} />
          <div className="absolute left-[46%] right-2 top-3">
            <h3 className="truncate text-[clamp(6px,0.98vw,11px)] font-black text-cyan-50">{memory.title}</h3>
            <p className="mt-1 line-clamp-2 text-[clamp(5px,0.72vw,8px)] font-semibold leading-[1.35] text-cyan-100/58">{memory.text}</p>
            <p className="mt-2 truncate text-[clamp(5px,0.68vw,7.5px)] font-bold text-cyan-100/42">来自：{memory.from} <span className="ml-2">{memory.date}</span></p>
          </div>
        </Link>
      ))}
    </SectionShell>
  )
}

export function HomeBlackRecommendedSection({ targets }: { targets: string[] }) {
  const section = sectionById("recommended-coordinates")
  return (
    <SectionShell section={section}>
      <div className="absolute inset-0 bg-[#050b19]" />
      <BlackSectionFrame />
      <BlackSectionHeading section={section} eyebrow="特色区域推荐" title="更多值得探索的坐标" ctaLabel="查看全部区域" ctaTo="/discover" top={20} />
      {recommendedCards.map((card, index) => (
        <Link key={card.title} data-home-black-hotspot={`进入推荐坐标${card.title}`} data-home-black-section-hotspot="recommended-coordinates" to={targets[index] || "/discover"} aria-label={["进入推荐坐标云湖数据馆", "进入推荐坐标风之中继塔", "进入推荐坐标樱花信标站"][index]} className="absolute overflow-hidden rounded-[1.15rem] border border-cyan-300/28 bg-[#06101f]/95 shadow-[0_0_30px_rgba(34,211,238,0.10)] transition hover:-translate-y-1" style={localStyleFromLight(section, 65 + index * 284, 62, 270, 176)}>
          <img src={card.image} srcSet={srcSet(card)} alt="" aria-hidden="true" className="h-[64%] w-full object-cover" decoding="async" draggable={false} />
          <div className="px-4 py-2">
            <h3 className="text-[clamp(8px,1.22vw,14px)] font-black text-cyan-50">{card.title}</h3>
            <p className="mt-1 truncate text-[clamp(5px,0.8vw,9px)] font-semibold text-cyan-100/62">{card.meta}</p>
            <div className="mt-2 flex gap-1.5">{card.chips.map((chip) => <NeonChip key={chip}>{chip}</NeonChip>)}</div>
          </div>
        </Link>
      ))}
    </SectionShell>
  )
}

export function HomeBlackCtaFooterSection() {
  const section = sectionById("cta-footer")
  return (
    <SectionShell section={section}>
      <div className="absolute inset-0 bg-[#030712]" />
      <div className="absolute overflow-hidden rounded-[1.1rem] border border-cyan-300/40 bg-[#071529] shadow-[0_0_35px_rgba(168,85,247,0.16)]" style={localStyleFromLight(section, 65, 5, 828, 86)}>
        <img src={homeBlackCtaCity} srcSet={`${homeBlackCtaCity} 1x, ${homeBlackCtaCity2x} 2x`} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-82" decoding="async" draggable={false} />
        <Link data-home-black-hotspot="开始你的下一段旅程" data-home-black-section-hotspot="cta-footer" to="/discover" aria-label="开始你的下一段旅程" className="absolute rounded-xl border-0 bg-transparent text-transparent outline-none transition focus-visible:ring-4 focus-visible:ring-fuchsia-300/70" style={{ left: "66%", top: "25%", width: "22%", height: "48%" }}>开始下一段</Link>
      </div>
      <div className="absolute" style={localStyleFromLight(section, 66, 132, 220, 96)}>
        <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full border border-cyan-300/45 bg-cyan-300/8 text-[10px] font-black text-cyan-50">FM</span><span><span className="block text-[clamp(8px,1.1vw,13px)] font-black text-cyan-50">FableMap</span><span className="block text-[clamp(4px,0.65vw,7px)] font-bold text-cyan-100/60">Cyber life on real coordinates</span></span></div>
        <p className="mt-4 text-[clamp(5px,0.8vw,9px)] font-semibold leading-[1.6] text-cyan-100/58">在真实坐标之上，造访角色、记忆与空间，探索属于你的无限未来。</p>
      </div>
      <div className="absolute grid grid-cols-5 gap-6" style={localStyleFromLight(section, 315, 132, 420, 98)}>
        {footerGroups.map((group) => (
          <div key={group.title}><h3 className="text-[clamp(5px,0.82vw,9px)] font-black text-cyan-100">{group.title}</h3><div className="mt-2 space-y-1">{group.items.map((item) => <Link key={item} data-home-black-hotspot={`页脚${item}`} data-home-black-section-hotspot="cta-footer" to={group.title === "创建" ? "/create" : "/discover"} className="block text-[clamp(5px,0.74vw,8px)] font-semibold text-cyan-100/48">{item}</Link>)}</div></div>
        ))}
      </div>
      <p className="absolute text-center text-[clamp(4px,0.7vw,8px)] font-semibold text-cyan-100/45" style={localStyleFromLight(section, 405, 250, 160, 14)}>© 2025 FableMap. All rights reserved.</p>
    </SectionShell>
  )
}

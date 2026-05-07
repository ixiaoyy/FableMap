# City Cyber Life Homepage Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the FableMap homepage shell so it preserves the original high-cyber `index` visual strength while repositioning the product from Tavern-only to “each real-world coordinate may hide an explorable world.”

**Architecture:** Keep the change scoped to the native React Router homepage route. Reuse the existing `neon-cyber-tavern-reference.png` as the hero visual baseline, update homepage copy/data/components, and keep all CTAs wired to existing routes without changing backend/API/schema.

**Tech Stack:** React Router route module, TypeScript/TSX, Tailwind utility classes, existing `lucide-react` icons, existing project-local PNG assets.

---

## File Structure / Change Map

- Modify: `frontend/app/routes/home.tsx`
  - Replace Tavern-only nav/copy/data with explorer-facing “city slice / explorable area” language.
  - Import and use `frontend/app/assets/homepage-reference/neon-cyber-tavern-reference.png` as the hero/poster visual baseline.
  - Keep existing lower-section assets under `frontend/app/assets/homepage-reference/modules/`.
  - Preserve links to `/discover`, `/create`, `/owner`, and existing `/tavern/:id` sample entries.
- Modify: `.trellis/tasks/04-28-next-feature-brainstorm/prd.md`
  - Add implementation completion notes after code is changed.
- Do not modify: backend files, schema docs, API contracts, route structure, or image files.

## Task 1: Prepare imports and homepage data language

**Files:**
- Modify: `frontend/app/routes/home.tsx`

- [ ] **Step 1: Update imports**

Replace the import block at the top of `frontend/app/routes/home.tsx` with this block. This removes unused icons and adds the original index reference image for the hero.

```tsx
import {
  ArrowRight,
  Brain,
  Crown,
  KeyRound,
  LockKeyhole,
  MapPinned,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import { Link } from "react-router"

import heroReferenceImage from "../assets/homepage-reference/neon-cyber-tavern-reference.png"
import memoryModuleImage from "../assets/homepage-reference/modules/memory-module.png"
import npcDialogueImage from "../assets/homepage-reference/modules/npc-dialogue.png"
import tavernNeonImage from "../assets/homepage-reference/modules/tavern-neon.png"
import tavernNightImage from "../assets/homepage-reference/modules/tavern-night.png"
import tavernStreetImage from "../assets/homepage-reference/modules/tavern-street.png"
import guardianPortrait from "../assets/npc-style-cast/portraits/guardian-a.png"
import merchantPortrait from "../assets/npc-style-cast/portraits/merchant-a.png"
import scholarPortrait from "../assets/npc-style-cast/portraits/scholar-a.png"
import spiritPortrait from "../assets/npc-style-cast/portraits/spirit-a.png"
import { Button } from "../ui/button"
```

- [ ] **Step 2: Replace Tavern-only type names and constants**

Replace `type TavernPreview`, `navItems`, `metrics`, `taverns`, and `features` with this code. Keep the sample entries linked to existing tavern IDs, but present them as “areas / city slices” on the homepage.

```tsx
type CitySlicePreview = {
  image: string
  name: string
  location: string
  distance: string
  tags: string[]
  id: string
}

const navItems = [
  { to: "/discover", label: "探索" },
  { to: "/discover", label: "区域" },
  { to: "/discover", label: "角色" },
  { to: "/discover", label: "记忆" },
  { to: "/create", label: "创建空间" },
]

const metrics: Metric[] = [
  { icon: MapPinned, value: "1,248+", label: "发光坐标" },
  { icon: UsersRound, value: "356+", label: "AI 角色" },
  { icon: MessageCircle, value: "28,690+", label: "相遇记录" },
  { icon: Star, value: "4.9", label: "回访期待" },
]

const citySlices: CitySlicePreview[] = [
  { image: tavernNightImage, name: "夜莺门牌", location: "成都 · 宽窄巷子", distance: "320m", tags: ["可进入", "记忆回响"], id: "pw_lantern_helpdesk" },
  { image: tavernNeonImage, name: "雾红坐标", location: "重庆 · 九街", distance: "1.2km", tags: ["霓虹深夜", "角色在线"], id: "pw_third_shelf_observatory" },
  { image: tavernStreetImage, name: "黑猫区域", location: "广州 · 永庆坊", distance: "2.1km", tags: ["社区温度", "等待探索"], id: "pw_community_repair" },
]

const features: Feature[] = [
  { icon: MapPinned, title: "真实坐标", text: "每个入口都落在现实地图上，而不是漂浮空间。" },
  { icon: Brain, title: "记忆回响", text: "角色和区域会保留回访上下文，让相遇不只是一次性对话。" },
  { icon: ShieldCheck, title: "主人边界", text: "内容、访问和记忆权限由空间主人控制，平台不越权发布。" },
]
```

- [ ] **Step 3: Run TypeScript check for immediate syntax feedback**

Run:

```powershell
npm --prefix .\frontend run typecheck
```

Expected if only Task 1 is applied: TypeScript should either pass or report remaining references to `TavernPreview` / `taverns`. If references remain, continue to Task 2 and Task 3 before treating this as a defect.

## Task 2: Update nav and card component naming/copy

**Files:**
- Modify: `frontend/app/routes/home.tsx`

- [ ] **Step 1: Replace brand/nav copy in `HomeNav`**

Inside `HomeNav`, replace the brand subtitle and action labels with this code shape:

```tsx
<p className="font-black tracking-wide text-white">FableMap</p>
<p className="text-xs text-violet-100/45">Cyber life on real coordinates</p>
```

Replace the search placeholder text:

```tsx
<span className="truncate">搜索附近坐标、角色、记忆线索</span>
```

Replace the owner/create button label:

```tsx
<Link to="/owner">主人入口</Link>
```

Keep the discover button label as:

```tsx
<Link to="/discover">开始探索</Link>
```

- [ ] **Step 2: Rename `TavernPreviewCard` to `CitySlicePreviewCard`**

Replace the function signature and prop type:

```tsx
function CitySlicePreviewCard({ image, name, location, distance, tags, id }: CitySlicePreview) {
```

Keep the link target as `/tavern/${id}` for this stage because backend route/model work is out of scope.

- [ ] **Step 3: Update card image alt text**

Inside `CitySlicePreviewCard`, replace the image alt text with:

```tsx
alt={`${name} 区域封面`}
```

- [ ] **Step 4: Replace all `taverns.map` references**

Replace every `taverns.map` call with:

```tsx
citySlices.map
```

Replace every `<TavernPreviewCard ... />` usage with:

```tsx
<CitySlicePreviewCard key={citySlice.name} {...citySlice} />
```

When mapping inline links, use `citySlice` as the item name:

```tsx
{citySlices.map((citySlice) => (
  <Link key={citySlice.name} to={`/tavern/${citySlice.id}`} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition hover:border-cyan-300/45">
    <img src={citySlice.image} alt="" className="h-32 w-full object-cover sm:h-36 lg:h-40" loading="lazy" decoding="async" />
    <div className="p-4">
      <p className="truncate font-black text-white">{citySlice.name}</p>
      <p className="mt-1 text-xs text-violet-100/55">{citySlice.location}</p>
      <p className="mt-2 text-xs font-bold text-cyan-100/70">距离 {citySlice.distance}</p>
    </div>
  </Link>
))}
```

- [ ] **Step 5: Run typecheck**

Run:

```powershell
npm --prefix .\frontend run typecheck
```

Expected: no unresolved `TavernPreview` or `taverns` symbols remain.

## Task 3: Replace product preview with high-quality hero visual baseline

**Files:**
- Modify: `frontend/app/routes/home.tsx`

- [ ] **Step 1: Replace `ProductPreview` with `HeroPosterPreview`**

Replace the entire `ProductPreview` function with this component. It uses the original index reference as a high-quality visual baseline and adds only lightweight overlays.

```tsx
function HeroPosterPreview() {
  return (
    <div className="relative min-h-[540px] overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-slate-950 shadow-[0_30px_90px_rgba(0,0,0,0.45)] lg:min-h-[640px]">
      <img
        src={heroReferenceImage}
        alt="FableMap 城市视觉基准"
        className="absolute inset-0 h-full w-full object-cover"
        decoding="async"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_28%,rgba(0,214,201,0.18),transparent_15rem),linear-gradient(90deg,rgba(3,5,18,0.74),rgba(3,5,18,0.12)_54%,rgba(3,5,18,0.36))]" />
      <div className="absolute left-5 top-5 rounded-full border border-cyan-300/28 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-100 backdrop-blur-md">
        Signal detected
      </div>
      <div className="absolute bottom-6 left-6 max-w-sm rounded-3xl border border-white/14 bg-slate-950/58 p-5 backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/80">附近坐标 · 23:47</p>
        <p className="mt-3 text-sm leading-6 text-violet-100/78">这里不是普通地图标记。有人、记忆和一个还没被你进入的世界，正在亮起。</p>
      </div>
      <div className="absolute bottom-6 right-6 hidden rounded-full border border-fuchsia-300/24 bg-fuchsia-300/10 px-4 py-2 text-xs font-black text-fuchsia-100 backdrop-blur-md sm:block">
        EXPLORE / REAL COORDINATE
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace `<ProductPreview />` usage**

In the hero section, replace:

```tsx
<ProductPreview />
```

with:

```tsx
<HeroPosterPreview />
```

- [ ] **Step 3: Run typecheck**

Run:

```powershell
npm --prefix .\frontend run typecheck
```

Expected: no `ProductPreview` reference remains and no unused `heroReferenceImage` import warning/error appears.

## Task 4: Rebuild the homepage hero copy and layout hierarchy

**Files:**
- Modify: `frontend/app/routes/home.tsx`

- [ ] **Step 1: Replace hero text block inside `HomeRoute`**

In the first `<section>` under `<HomeNav />`, keep the grid layout but replace the left content `<div className="space-y-7">...</div>` with this code. It removes first-screen type chips and long explanation.

```tsx
<div className="space-y-7">
  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/28 bg-cyan-300/8 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
    <Sparkles className="h-3.5 w-3.5" />
    Real coordinates. Hidden worlds.
  </div>
  <div className="space-y-5">
    <h1 className="max-w-2xl text-5xl font-black leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-[4.8rem]">
      每个坐标，都可能藏着一个世界
    </h1>
    <p className="max-w-xl text-base leading-8 text-violet-100/70 sm:text-lg">
      在真实地图上，进入一个个会回应你的区域。
    </p>
  </div>
  <div className="flex flex-col gap-3 sm:flex-row">
    <Button asChild size="lg">
      <Link to="/discover">
        开始探索
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
    <Button asChild variant="secondary" size="lg">
      <Link to="/create">
        创建我的空间
        <KeyRound className="h-4 w-4" />
      </Link>
    </Button>
  </div>
</div>
```

- [ ] **Step 2: Adjust the hero section container for poster emphasis**

Change the first hero section class from:

```tsx
<section className="relative mx-auto grid max-w-[1320px] gap-12 px-6 py-14 lg:grid-cols-[0.68fr_1.32fr] lg:items-center lg:py-20">
```

To:

```tsx
<section className="relative mx-auto grid min-h-[calc(100vh-88px)] max-w-[1440px] gap-12 px-6 py-12 lg:grid-cols-[0.58fr_1.42fr] lg:items-center lg:py-16">
```

- [ ] **Step 3: Run typecheck**

Run:

```powershell
npm --prefix .\frontend run typecheck
```

Expected: TypeScript passes.

## Task 5: Update lower homepage sections without over-explaining the hero

**Files:**
- Modify: `frontend/app/routes/home.tsx`

- [ ] **Step 1: Update featured section labels**

Replace the section aria label and headings:

```tsx
<section className="relative mx-auto max-w-[1320px] px-6 py-16" aria-labelledby="featured-city-slices">
```

Inside it, replace:

```tsx
<p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100/75">热门空间</p>
<h2 id="featured-taverns" className="mt-2 text-3xl font-black text-white sm:text-4xl">
  从地图进入真实的故事
</h2>
```

With:

```tsx
<p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100/75">正在发光的区域</p>
<h2 id="featured-city-slices" className="mt-2 text-3xl font-black text-white sm:text-4xl">
  从地图进入未被看见的世界
</h2>
```

- [ ] **Step 2: Update NPC module copy**

Replace the NPC module title and paragraph:

```tsx
<h2 className="text-2xl font-black text-white">AI 角色相遇</h2>
<p className="text-sm leading-6 text-violet-100/64">进入区域后，和其中的角色对话、建立关系，让一次访问变成可回访的生活片段。</p>
```

Keep the CTA:

```tsx
<Button asChild>
  <Link to="/discover">开始对话</Link>
</Button>
```

- [ ] **Step 3: Update memory module copy**

Replace the memory card title, paragraph, quote, and CTA label:

```tsx
<h2 className="text-2xl font-black text-white">回访记忆</h2>
<p className="max-w-md text-sm leading-6 text-violet-100/72">你做过的选择、说过的话和建立过的关系，会成为下一次进入同一坐标时的上下文。</p>
<div className="rounded-2xl border border-white/10 bg-slate-950/62 p-4 backdrop-blur-md">
  <p className="text-sm leading-6 text-violet-100/72">上次你来过这里。有人还记得你留下的问题。</p>
</div>
<Button asChild variant="secondary">
  <Link to="/discover">继续探索</Link>
</Button>
```

- [ ] **Step 4: Run typecheck**

Run:

```powershell
npm --prefix .\frontend run typecheck
```

Expected: TypeScript passes and there are no duplicate `id="featured-taverns"` references.

## Task 6: Verify copy boundaries and build

**Files:**
- Modify: `.trellis/tasks/04-28-next-feature-brainstorm/prd.md`

- [ ] **Step 1: Search for disallowed/overly narrow first-screen copy**

Run:

```powershell
Select-String -Path frontend/app/routes/home.tsx -Pattern 'Cyber taverns|空间收录|热门空间|开店|店主入口|Home / 学校|学校 / 店铺|Home、学校|空间和角色关系放回真实坐标' -CaseSensitive:$false
```

Expected: no matches for old Tavern-only homepage framing. Specific sample names like `夜莺门牌` may remain because they are example entries, not hero/product category framing.

- [ ] **Step 2: Run frontend build**

Run:

```powershell
npm --prefix .\frontend run build
```

Expected: build exits 0.

- [ ] **Step 3: Browser visual check**

Open `/` in the browser after build/dev server is available. Check:

- Desktop: hero uses original high-cyber visual quality; first screen has minimal copy and no type chips.
- Narrow screen: title, CTA, and visual focal area are not cropped into unreadability.
- Links: “开始探索” goes to `/discover`; “创建我的空间” goes to `/create`; nav entries remain clickable.

- [ ] **Step 4: Record completion notes in Trellis PRD**

Append this template to `.trellis/tasks/04-28-next-feature-brainstorm/prd.md` with actual command outputs:

```markdown
## Implementation Notes

* Changed `frontend/app/routes/home.tsx` to use original index visual baseline for the homepage hero.
* Updated hero headline to “每个坐标，都可能藏着一个世界”.
* Removed first-screen type chips and old Tavern-only framing.
* Verification:
  * `npm --prefix .\frontend run typecheck`: <result>
  * `npm --prefix .\frontend run build`: <result>
  * Browser visual check: <result / notes>
```

- [ ] **Step 5: Commit only the scoped files after user approval**

Because the workspace contains many unrelated uncommitted changes, do not run broad `git add -A`. If the user confirms commit, stage only the exact scoped files:

```powershell
git add frontend/app/routes/home.tsx .trellis/tasks/04-28-next-feature-brainstorm/prd.md .trellis/tasks/04-28-next-feature-brainstorm/design.md .trellis/tasks/04-28-next-feature-brainstorm/implementation-plan.md
git commit -m "feat(home): reposition homepage as cyber city life shell"
```

Expected: commit includes only this task's scoped files.

## Self-Review

- Spec coverage: The plan implements the approved hero title, reuses the existing index visual baseline, removes first-screen type chips, avoids API/schema/backend changes, and preserves route links.
- Placeholder scan: No `TBD`, `TODO`, or unspecified implementation steps remain.
- Type consistency: `CitySlicePreview`, `citySlices`, and `CitySlicePreviewCard` names are consistent across tasks.
- Scope check: This is limited to Stage 1 homepage shell. Discovery/create/detail/interior pages remain future tasks.

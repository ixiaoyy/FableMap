import { Link } from "react-router"

import referenceImage from "../assets/homepage-reference/neon-cyber-tavern-reference.png"

type Hotspot = {
  to: string
  label: string
  className: string
}

const hotspots: Hotspot[] = [
  { to: "/", label: "FableMap 首页", className: "left-[3.5%] top-[2.4%] h-[5%] w-[25%]" },
  { to: "/discover", label: "导航：探索", className: "left-[30.6%] top-[4.7%] h-[4.4%] w-[7.2%]" },
  { to: "/discover", label: "导航：酒馆", className: "left-[39%] top-[4.7%] h-[4.4%] w-[7.2%]" },
  { to: "/discover", label: "导航：NPC", className: "left-[47.1%] top-[4.7%] h-[4.4%] w-[7.2%]" },
  { to: "/discover", label: "导航：记忆", className: "left-[55.5%] top-[4.7%] h-[4.4%] w-[7.2%]" },
  { to: "/create", label: "导航：社区", className: "left-[63.6%] top-[4.7%] h-[4.4%] w-[7.2%]" },
  { to: "/create", label: "右上按钮：登录", className: "left-[74.2%] top-[4.3%] h-[4.7%] w-[8.8%]" },
  { to: "/discover", label: "右上按钮：进入酒馆", className: "left-[84.2%] top-[4.3%] h-[4.9%] w-[12.5%]" },
  { to: "/discover", label: "首屏按钮：进入酒馆", className: "left-[6.1%] top-[31.1%] h-[5%] w-[17.1%]" },
  { to: "/discover", label: "首屏按钮：探索地图", className: "left-[24.2%] top-[31.1%] h-[5%] w-[19.6%]" },
  { to: "/discover", label: "热门酒馆列表", className: "left-[4.7%] top-[48.2%] h-[19.2%] w-[89.7%]" },
  { to: "/discover", label: "AI NPC 对话区", className: "left-[4.7%] top-[70.2%] h-[15.4%] w-[47.4%]" },
  { to: "/discover", label: "你的记忆区", className: "left-[54.5%] top-[70.2%] h-[15.4%] w-[40.7%]" },
  { to: "/discover", label: "底部价值条", className: "left-[4.7%] top-[89%] h-[8.4%] w-[89.7%]" },
]

function HotspotLink({ to, label, className }: Hotspot) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={`absolute block rounded-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040713] ${className}`}
    />
  )
}

export default function HomeRoute() {
  return (
    <main className="min-h-screen bg-[#030512] px-3 py-4 text-white sm:px-6 sm:py-8">
      <h1 className="sr-only">FableMap 霓虹赛博酒馆首页参考版</h1>
      <p className="sr-only">当前首页直接使用用户确认的参考图，保持相同布局与相同图片内容。</p>
      <nav className="sr-only" aria-label="Homepage quick routes">
        <Link to="/discover">发现酒馆</Link>
        <Link to="/create">开一间酒馆</Link>
      </nav>

      <div className="mx-auto w-full max-w-[729px]">
        <div className="relative">
          <img
            src={referenceImage}
            alt="FableMap 霓虹赛博酒馆首页参考图"
            className="block h-auto w-full"
            decoding="async"
            loading="eager"
          />
          {hotspots.map((hotspot) => (
            <HotspotLink key={hotspot.label} {...hotspot} />
          ))}
        </div>
      </div>
    </main>
  )
}

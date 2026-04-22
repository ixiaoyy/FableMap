import { MapPinned, Sparkles } from "lucide-react"
import { NavLink } from "react-router"

import { cn } from "../lib/utils"

const navItems = [
  { to: "/", label: "首页" },
  { to: "/discover", label: "发现" },
  { to: "/create", label: "开店" },
]

export function ProductShell({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen w-[min(1120px,calc(100vw-32px))] px-4 py-7 text-violet-50 sm:px-0">
      <header className="mb-14 flex flex-col gap-4 sm:mb-20 sm:flex-row sm:items-center sm:justify-between" aria-label="FableMap navigation">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-300 to-cyan-300 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20">
            FM
          </span>
          <div>
            <p className="font-black tracking-[0.2em] text-white">FableMap</p>
            <p className="text-xs text-violet-100/55">Cyber taverns on real places</p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "border-cyan-300/70 bg-cyan-300/15 text-white shadow-[0_0_28px_rgba(0,214,201,0.18)]"
                    : "border-white/12 bg-white/6 text-violet-100/70 hover:bg-white/10 hover:text-white",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
        <Sparkles className="h-3.5 w-3.5" />
        {eyebrow}
      </div>
      {children}
      <footer className="mt-16 flex items-center gap-2 border-t border-white/10 pt-6 text-sm text-violet-100/45">
        <MapPinned className="h-4 w-4" />
        Real coordinate anchored. Owner-authored. AI-powered tavern experience.
      </footer>
    </main>
  )
}

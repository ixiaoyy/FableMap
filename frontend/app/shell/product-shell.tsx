import { Compass, Home, MapPinned, PlusCircle, Sparkles, UserRound } from "lucide-react"
import { NavLink } from "react-router"

import { cn } from "../lib/utils"

const navItems = [
  { to: "/", label: "首页", icon: Home },
  { to: "/discover", label: "发现", icon: Compass },
  { to: "/create", label: "创建空间", icon: PlusCircle },
  { to: "/owner", label: "主人", icon: UserRound },
]

export function ProductShell({
  eyebrow,
  children,
}: {
  eyebrow: string
  children: React.ReactNode
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030512] text-violet-50">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_8%,rgba(217,70,239,0.16),transparent_28rem),radial-gradient(circle_at_86%_14%,rgba(0,214,201,0.14),transparent_30rem),linear-gradient(180deg,rgba(3,5,18,0),rgba(3,5,18,0.92))]" />
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#050615]/90 backdrop-blur-xl" aria-label="FableMap navigation">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <NavLink to="/" end className="flex min-h-11 w-fit touch-manipulation items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-cyan-300/40 bg-cyan-300/8 text-sm font-black text-cyan-100 shadow-[0_0_28px_rgba(0,214,201,0.18)]">
              FM
            </span>
            <div>
              <p className="font-black tracking-wide text-white">FableMap</p>
              <p className="text-xs text-violet-100/45">Cyber life on real coordinates</p>
            </div>
          </NavLink>
          <nav className="-mx-1 flex max-w-full flex-wrap items-center gap-2 overflow-x-auto px-1 pb-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "inline-flex min-h-11 touch-manipulation items-center rounded-full border px-4 py-2 text-sm font-semibold transition",
                    isActive
                      ? "border-cyan-300/60 bg-cyan-300/15 text-white shadow-[0_0_28px_rgba(0,214,201,0.18)]"
                      : "border-white/10 bg-white/[0.045] text-violet-100/70 hover:border-white/18 hover:bg-white/10 hover:text-white",
                  )
                }
              >
                <item.icon className="mr-2 hidden h-4 w-4 sm:block" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <nav
        className="mobile-bottom-dock fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 gap-1 rounded-[1.5rem] border border-white/12 bg-slate-950/88 p-1.5 shadow-2xl shadow-black/45 backdrop-blur-xl lg:hidden"
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex min-h-14 touch-manipulation flex-col items-center justify-center gap-1 rounded-[1.1rem] px-2 text-[0.68rem] font-bold transition",
                isActive
                  ? "bg-cyan-300/18 text-white shadow-[0_0_26px_rgba(0,214,201,0.18)]"
                  : "text-violet-100/58 hover:bg-white/8 hover:text-violet-50",
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="max-w-full truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="relative mx-auto w-full max-w-[1320px] px-4 py-8 pb-28 sm:px-6 sm:py-12 lg:pb-12">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/24 bg-cyan-300/8 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
          <Sparkles className="h-3.5 w-3.5" />
          {eyebrow}
        </div>
        {children}
        <footer className="mt-16 flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-violet-100/45 sm:flex-row sm:items-center">
          <MapPinned className="h-4 w-4 text-cyan-100/60" />
          <span>Real coordinate anchored. Owner-authored. AI-powered living spaces.</span>
        </footer>
      </div>
    </main>
  )
}

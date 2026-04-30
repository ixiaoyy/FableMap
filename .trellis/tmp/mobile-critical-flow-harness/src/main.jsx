import React from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import '../../../../frontend/app/styles.css'
import { ProductShell } from '../../../../frontend/app/shell/product-shell.tsx'

function App() {
  return (
    <MemoryRouter initialEntries={['/discover']}>
      <ProductShell eyebrow="Discover">
        <section id="discover-mainline" className="grid scroll-mt-28 gap-4 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/70">发现主线验收</p>
          <h1 className="text-3xl font-black text-white">附近坐标正在发光</h1>
          <p className="text-sm leading-6 text-violet-100/66">这个 harness 用于验证移动首屏只出现一条主线提示、底部 dock 不遮挡 CTA。</p>
          <a className="inline-flex min-h-14 touch-manipulation items-center justify-center rounded-2xl border border-cyan-300/32 bg-cyan-300/14 px-4 text-sm font-black text-cyan-50" href="#discover-mainline">进入发现主线</a>
        </section>
      </ProductShell>
    </MemoryRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)

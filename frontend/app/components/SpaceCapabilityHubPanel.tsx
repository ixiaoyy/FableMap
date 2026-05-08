/**
 * SpaceCapabilityHubPanel
 *
 * Renders capability cards in "更多空间功能" section of TavernChatWorkbench.
 * Based on PRD approach D1/D2 (轻量版空间能力聚合枢纽).
 */

import { useState } from "react"
import { deriveCapabilityProfile, sortCapabilityCards, groupCapabilityCards, type CapabilityCard, type CapabilityGroup } from "../lib/space-capability-hub"
import type { Tavern } from "../lib/taverns"
import { MiniGameWorkshopPanel } from "./MiniGameWorkshopPanel"

type SpaceCapabilityHubPanelProps = {
  tavern: Tavern
  onCapabilityClick?: (card: CapabilityCard) => void
}

/**
 * Group label and icon per category
 */
const CATEGORY_LABELS: Record<CapabilityCard["category"], { label: string; icon: string; description: string }> = {
  chat_core: { label: "聊天核心", icon: "💬", description: "邀请、回访、反馈" },
  interactive: { label: "互动玩法", icon: "🎮", description: "剧情小剧场与任务入口" },
  work_assistant: { label: "工作助手", icon: "🛠️", description: "帮你整理思路和待办" },
  mini_game: { label: "小游戏工坊", icon: "🎯", description: "经典 OSS 小游戏白名单" },
}

function CardGridItem({
  card,
  onClick,
}: {
  card: CapabilityCard
  onClick?: (card: CapabilityCard) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(card)}
      className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-cyan-300/35 hover:bg-cyan-300/8"
    >
      <span className="shrink-0 text-2xl">{card.icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black text-white">{card.label}</span>
        <span className="mt-0.5 block line-clamp-2 text-xs leading-4 text-violet-50/56">
          {card.description}
        </span>
      </span>
      {card.badge ? (
        <span className="shrink-0 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[0.65rem] font-bold text-cyan-100">
          {card.badge}
        </span>
      ) : (
        <span className="shrink-0 text-[0.7rem] text-cyan-100/48 group-hover:text-cyan-200/78">→</span>
      )}
    </button>
  )
}

function isMiniGameCard(card: CapabilityCard): boolean {
  return card.category === "mini_game"
}

function CapabilityCategorySection({
  group,
  onCardClick,
}: {
  group: CapabilityGroup
  onCardClick?: (card: CapabilityCard) => void
}) {
  const meta = CATEGORY_LABELS[group.category]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-base">{meta.icon}</span>
        <span className="text-sm font-black text-white">{meta.label}</span>
        <span className="text-xs text-violet-100/45">{meta.description}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {group.cards.map((card) => (
          <CardGridItem key={card.id} card={card} onClick={onCardClick} />
        ))}
      </div>
    </div>
  )
}

export function SpaceCapabilityHubPanel({ tavern, onCapabilityClick }: SpaceCapabilityHubPanelProps) {
  const [showMiniGame, setShowMiniGame] = useState(false)

  const profile = deriveCapabilityProfile(tavern)
  const sortedCards = sortCapabilityCards(profile)
  const groups = groupCapabilityCards(sortedCards)

  function handleCardClick(card: CapabilityCard) {
    if (isMiniGameCard(card)) {
      setShowMiniGame(true)
      return
    }
    onCapabilityClick?.(card)
  }

  if (showMiniGame) {
    return (
      <div className="space-y-4">
        <MiniGameWorkshopPanel onBack={() => setShowMiniGame(false)} />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/62">Space Capabilities</p>
          <p className="mt-1 text-sm font-semibold text-violet-50/72">
            {tavern.place_type ? `${tavern.place_type} · ` : ""}{tavern.layout_style ? `${tavern.layout_style} 布局` : ""}空间能力聚合
          </p>
        </div>
        <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-xs font-bold text-violet-100">
          {sortedCards.length} 个能力
        </span>
      </div>

      {/* Place type badge */}
      {tavern.place_type && (
        <div className="rounded-2xl border border-cyan-300/18 bg-cyan-300/8 p-3">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/62">当前空间类型</p>
          <p className="mt-1 text-sm font-semibold text-cyan-50">
            {tavern.place_type} {tavern.layout_style ? `· ${tavern.layout_style}` : ""}
          </p>
          <p className="mt-1 text-xs text-cyan-100/62">
            能力卡片已按空间类型自动排序
          </p>
        </div>
      )}

      {/* Category sections */}
      <div className="space-y-4">
        {groups.map((group) => (
          <CapabilityCategorySection key={group.category} group={group} onCardClick={handleCardClick} />
        ))}
      </div>

      {/* Footer hint */}
      <p className="text-center text-[0.7rem] text-violet-100/38">
        点击卡片使用能力 · 完成可回到聊天主线
      </p>
    </div>
  )
}

/**
 * Simple inline capability grid for compact usage
 */
export function SpaceCapabilityGrid({ tavern, onCardClick }: { tavern: Tavern; onCardClick?: (card: CapabilityCard) => void }) {
  const profile = deriveCapabilityProfile(tavern)
  const sortedCards = sortCapabilityCards(profile).slice(0, 6) // Max 6 cards for compact view

  return (
    <div className="flex flex-wrap gap-2">
      {sortedCards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() => onCardClick?.(card)}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-violet-50/72 transition hover:border-cyan-300/35 hover:bg-cyan-300/8 hover:text-cyan-50"
        >
          <span>{card.icon}</span>
          <span>{card.label}</span>
        </button>
      ))}
    </div>
  )
}
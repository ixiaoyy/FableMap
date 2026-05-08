/**
 * Space Capability Hub — unit tests
 */

import { describe, it, expect } from "vitest"
import {
  deriveCapabilityProfile,
  sortCapabilityCards,
  groupCapabilityCards,
  MINI_GAME_WHITELIST,
} from "../app/lib/space-capability-hub"

const mockTavern = (overrides = {}) => ({
  id: "test-tavern",
  name: "测试空间",
  description: "一个用于测试的空间",
  place_type: "tavern",
  layout_style: "npc-chat",
  characters: [],
  gameplay_definitions: [],
  ...overrides,
})

describe("deriveCapabilityProfile", () => {
  it("returns profile with 4 categories for default tavern", () => {
    const profile = deriveCapabilityProfile(mockTavern())
    expect(profile.placeType).toBe("tavern")
    expect(profile.layoutStyle).toBe("npc-chat")
    expect(profile.cards.length).toBeGreaterThan(0)
    expect(profile.sortOrder).toEqual(["chat_core", "work_assistant", "interactive", "mini_game"])
  })

  it("maps school place_type to school work_assistant cards", () => {
    const profile = deriveCapabilityProfile(mockTavern({ place_type: "school" }))
    const workCards = profile.cards.filter((c) => c.category === "work_assistant")
    expect(workCards.some((c) => c.id === "school-process-assist")).toBe(true)
    expect(workCards.some((c) => c.id === "school-material-sort")).toBe(true)
  })

  it("maps hospital place_type to hospital work_assistant cards", () => {
    const profile = deriveCapabilityProfile(mockTavern({ place_type: "hospital" }))
    const workCards = profile.cards.filter((c) => c.category === "work_assistant")
    expect(workCards.some((c) => c.id === "hospital-companion-list")).toBe(true)
    expect(workCards.some((c) => c.id === "hospital-risk-hint")).toBe(true)
  })

  it("maps quest-play layout to interactive-first sort order", () => {
    const profile = deriveCapabilityProfile(mockTavern({ layout_style: "quest-play" }))
    expect(profile.sortOrder).toEqual(["interactive", "mini_game", "chat_core", "work_assistant"])
  })

  it("includes chat_core cards for any tavern", () => {
    const profile = deriveCapabilityProfile(mockTavern())
    expect(profile.cards.some((c) => c.id === "chat-core-invite")).toBe(true)
    expect(profile.cards.some((c) => c.id === "chat-core-feedback")).toBe(true)
  })

  it("includes mini_game cards for any tavern", () => {
    const profile = deriveCapabilityProfile(mockTavern())
    expect(profile.cards.some((c) => c.id === "mini-game-guess-number")).toBe(true)
    expect(profile.cards.some((c) => c.id === "mini-game-memory-cards")).toBe(true)
  })

  it("maps gameplay_definitions to interactive cards", () => {
    const tavern = mockTavern({
      gameplay_definitions: [
        { id: "gp1", name: "小剧场", description: "剧情选择" },
        { id: "gp2", name: "任务", description: "完成目标" },
      ],
    })
    const profile = deriveCapabilityProfile(tavern)
    const interactiveCards = profile.cards.filter((c) => c.category === "interactive")
    expect(interactiveCards.length).toBe(2)
    expect(interactiveCards[0].label).toBe("小剧场")
  })

  it("includes group-chat card when multiple characters exist", () => {
    const profile = deriveCapabilityProfile(
      mockTavern({ characters: [{ id: "npc1" }, { id: "npc2" }] }),
    )
    expect(profile.cards.some((c) => c.id === "chat-core-group-chat")).toBe(true)
  })
})

describe("sortCapabilityCards", () => {
  it("sorts by category order in profile", () => {
    const profile = deriveCapabilityProfile(mockTavern({ layout_style: "quest-play" }))
    const sorted = sortCapabilityCards(profile)
    const categories = sorted.map((c) => c.category)
    expect(categories.indexOf("interactive")).toBeLessThan(categories.indexOf("mini_game"))
    expect(categories.indexOf("mini_game")).toBeLessThan(categories.indexOf("chat_core"))
    expect(categories.indexOf("chat_core")).toBeLessThan(categories.indexOf("work_assistant"))
  })
})

describe("groupCapabilityCards", () => {
  it("groups cards by category", () => {
    const profile = deriveCapabilityProfile(mockTavern())
    const sorted = sortCapabilityCards(profile)
    const groups = groupCapabilityCards(sorted)
    expect(groups.length).toBeGreaterThanOrEqual(3) // chat_core, work_assistant, mini_game (interactive only if gameplay_definitions exist)
    const categories = groups.map((g) => g.category)
    expect(categories).toContain("chat_core")
    expect(categories).toContain("mini_game")
  })

  it("each group has label, icon and cards", () => {
    const profile = deriveCapabilityProfile(mockTavern())
    const sorted = sortCapabilityCards(profile)
    const groups = groupCapabilityCards(sorted)
    for (const group of groups) {
      expect(group.label).toBeTruthy()
      expect(group.icon).toBeTruthy()
      expect(Array.isArray(group.cards)).toBe(true)
    }
  })
})

describe("MINI_GAME_WHITELIST", () => {
  it("contains self-designed mini-games", () => {
    expect(MINI_GAME_WHITELIST.length).toBeGreaterThan(0)
    expect(MINI_GAME_WHITELIST.every((c) => c.category === "mini_game")).toBe(true)
    expect(MINI_GAME_WHITELIST.some((c) => c.id === "mini-game-guess-number")).toBe(true)
    expect(MINI_GAME_WHITELIST.some((c) => c.id === "mini-game-memory-cards")).toBe(true)
  })
})
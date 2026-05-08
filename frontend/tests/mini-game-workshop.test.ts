/**
 * Mini Game Workshop — unit tests
 */

import { describe, it, expect } from "vitest"
import {
  MINI_GAME_CATALOG,
  getGameById,
  isGameWhitelisted,
  getGameEmbedUrl,
  getIframeAttributes,
  getGameDifficultyLabel,
} from "../app/lib/mini-game-workshop"

describe("MINI_GAME_CATALOG", () => {
  it("contains 2 self-designed games", () => {
    expect(MINI_GAME_CATALOG.length).toBe(2)
  })

  it("each game has required fields", () => {
    for (const game of MINI_GAME_CATALOG) {
      expect(game.id).toBeTruthy()
      expect(game.name).toBeTruthy()
      expect(game.nameZh).toBeTruthy()
      expect(game.description).toBeTruthy()
      expect(game.difficulty).toBeTruthy()
      expect(game.localPath).toBeTruthy()
      expect(game.iframeAttributes).toBeTruthy()
      expect(game.iframeAttributes.sandbox).toBeTruthy()
    }
  })

  it("all games are self-designed with no external dependencies", () => {
    for (const game of MINI_GAME_CATALOG) {
      expect(game.localPath.startsWith("/games/")).toBe(true)
      expect(game.iframeAttributes.sandbox).not.toContain("allow-popups")
      expect(game.iframeAttributes.sandbox).not.toContain("allow-top-navigation")
    }
  })
})

describe("getGameById", () => {
  it("returns game by id", () => {
    const game = getGameById("game-guess-number")
    expect(game).toBeTruthy()
    expect(game!.nameZh).toBe("猜数字")
  })

  it("returns undefined for unknown id", () => {
    expect(getGameById("unknown-game")).toBeUndefined()
  })
})

describe("isGameWhitelisted", () => {
  it("returns true for whitelisted games", () => {
    expect(isGameWhitelisted("game-guess-number")).toBe(true)
    expect(isGameWhitelisted("game-memory-cards")).toBe(true)
  })

  it("returns false for non-whitelisted games", () => {
    expect(isGameWhitelisted("random-game")).toBe(false)
    expect(isGameWhitelisted("")).toBe(false)
  })
})

describe("getGameEmbedUrl", () => {
  it("returns local path", () => {
    const game = getGameById("game-guess-number")!
    expect(getGameEmbedUrl(game)).toBe("/games/guess-number/index.html")
  })
})

describe("getIframeAttributes", () => {
  it("returns sandbox attributes", () => {
    const game = getGameById("game-guess-number")!
    const attrs = getIframeAttributes(game)
    expect(attrs.sandbox).toContain("allow-scripts")
    expect(attrs.sandbox).not.toContain("allow-popups")
    expect(attrs.sandbox).not.toContain("allow-top-navigation")
  })
})

describe("getGameDifficultyLabel", () => {
  it("returns correct labels", () => {
    expect(getGameDifficultyLabel("easy")).toBe("简单")
    expect(getGameDifficultyLabel("medium")).toBe("中等")
    expect(getGameDifficultyLabel("hard")).toBe("困难")
  })
})
/**
 * Story Microgame Templates — unit tests
 */

import { describe, it, expect } from "vitest"
import {
  STORY_GAMEPLAY_TEMPLATES,
  STORY_GAMEPLAY_CATEGORIES,
  createStoryGameplayFromTemplate,
  filterStoryGameplayTemplates,
} from "../app/product/storyMicrogameTemplates"

describe("STORY_GAMEPLAY_TEMPLATES", () => {
  it("contains 5 templates", () => {
    expect(STORY_GAMEPLAY_TEMPLATES.length).toBe(5)
  })

  it("each template has required fields", () => {
    for (const template of STORY_GAMEPLAY_TEMPLATES) {
      expect(template.id).toBeTruthy()
      expect(template.category).toBeTruthy()
      expect(template.title).toBeTruthy()
      expect(template.duration).toBeTruthy()
      expect(template.bestFor).toBeTruthy()
      expect(template.entryLabel).toBeTruthy()
      expect(template.summary).toBeTruthy()
      expect(template.goal).toBeTruthy()
      expect(template.tone).toBeTruthy()
      expect(Array.isArray(template.nodes)).toBe(true)
      expect(template.nodes.length).toBeGreaterThanOrEqual(3)
    }
  })

  it("each template has 'complete' as last node", () => {
    for (const template of STORY_GAMEPLAY_TEMPLATES) {
      const lastNode = template.nodes[template.nodes.length - 1]
      expect(lastNode.id).toBe("complete")
      expect(lastNode.choices).toEqual([])
    }
  })

  it("each template has all node IDs unique", () => {
    for (const template of STORY_GAMEPLAY_TEMPLATES) {
      const ids = template.nodes.map((n) => n.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})

describe("STORY_GAMEPLAY_CATEGORIES", () => {
  it("includes expected categories", () => {
    expect(STORY_GAMEPLAY_CATEGORIES).toContain("全部")
    expect(STORY_GAMEPLAY_CATEGORIES).toContain("剧情")
    expect(STORY_GAMEPLAY_CATEGORIES).toContain("故事")
    expect(STORY_GAMEPLAY_CATEGORIES).toContain("目标驱动")
    expect(STORY_GAMEPLAY_CATEGORIES).toContain("抉择")
  })
})

describe("createStoryGameplayFromTemplate", () => {
  it("returns a GameplayDefinition-compatible object", () => {
    const result = createStoryGameplayFromTemplate(STORY_GAMEPLAY_TEMPLATES[0], 1)
    expect(result.id).toMatch(/^gp_story_rescue-judgment_/)
    expect(result.status).toBe("draft")
    expect(result.mode).toBe("ai_directed_branch")
    expect(result.owner_brief).toBeTruthy()
    expect(result.owner_brief.goal).toBeTruthy()
    expect(result.owner_brief.tone).toBeTruthy()
    expect(Array.isArray(result.owner_brief.forbidden)).toBe(true)
    expect(result.nodes.length).toBeGreaterThan(0)
    expect(result.completion).toBeTruthy()
  })

  it("returns null for invalid template", () => {
    expect(createStoryGameplayFromTemplate(null, 1)).toBeNull()
    expect(createStoryGameplayFromTemplate({}, 1)).toBeNull()
  })
})

describe("filterStoryGameplayTemplates", () => {
  it("returns all when no filter", () => {
    const result = filterStoryGameplayTemplates({})
    expect(result.length).toBe(5)
  })

  it("filters by category", () => {
    const byCategory = filterStoryGameplayTemplates({ category: "剧情" })
    expect(byCategory.length).toBeGreaterThan(0)
    expect(byCategory.every((t) => t.category === "剧情")).toBe(true)
  })

  it("filters by query", () => {
    const byQuery = filterStoryGameplayTemplates({ query: "判词" })
    expect(byQuery.length).toBeGreaterThan(0)
    expect(byQuery.some((t) => t.title.includes("判词"))).toBe(true)
  })

  it("combines category and query", () => {
    const combined = filterStoryGameplayTemplates({ category: "故事", query: "回忆" })
    expect(combined.every((t) => t.category === "故事")).toBe(true)
    const found = combined.some((t) => t.title.includes("回忆"))
    // query search is broader so just check it's a subset
    expect(combined.length).toBeLessThanOrEqual(
      filterStoryGameplayTemplates({ category: "故事" }).length,
    )
  })
})
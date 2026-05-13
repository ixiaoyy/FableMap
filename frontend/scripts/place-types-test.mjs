import assert from "node:assert/strict"

import {
  DISCOVERABLE_PLACE_TYPES,
  derivePlaceType,
  derivePlaceTypeDisplay,
  isDiscoverablePlaceType,
  placeTypeMatchesTavern,
} from "../app/lib/place-types.js"

const cases = [
  [{ name: "外星便利店", description: "24 小时发光货架", address: "上海市便利店街角", characters: [{ tags: ["便利店"] }] }, "convenience-store"],
  [{ name: "第三中学传达室", description: "老师和学生都熟悉这里。", address: "第三中学", characters: [{ tags: ["学校"] }] }, "school"],
  [{ name: "夜间护理站", description: "公共医院附近的护士站", characters: [{ tags: ["医院", "护士"] }] }, "hospital"],
  [{ name: "夜莺空间", characters: [] }, "tavern"],
]
assert.deepEqual(cases.map(([tavern]) => derivePlaceType(tavern)), cases.map(([, type]) => type))

const cafeDisplay = derivePlaceTypeDisplay({ name: "转角咖啡", description: "咖啡师、拿铁和读书角" })
assert.ok(cafeDisplay.id === "cafe" && cafeDisplay.label === "咖啡店" && cafeDisplay.icon && cafeDisplay.tone && cafeDisplay.cardClass.includes("border-"))
assert.ok(DISCOVERABLE_PLACE_TYPES.every((type) => type.tone && type.id !== "home"))
assert.ok(isDiscoverablePlaceType("hospital") && DISCOVERABLE_PLACE_TYPES.some((type) => type.id === "hospital"))
assert.ok(derivePlaceType({ name: "阿璃的 Home", description: "个人家", characters: [{ tags: ["家庭"] }] }) === "home" && !isDiscoverablePlaceType("home"))

const convenience = cases[0][0]
const persistedSchool = { place_type: "school", name: "夜莺空间", description: "名字像空间，但后端字段已经确认它是学校。" }
const persistedHome = { place_type: "home", name: "公开描述里没有 home 关键词" }
assert.deepEqual(
  [placeTypeMatchesTavern(convenience, "convenience-store"), placeTypeMatchesTavern(convenience, "school"), placeTypeMatchesTavern(persistedSchool, "school"), derivePlaceType(persistedHome), isDiscoverablePlaceType(persistedHome.place_type)],
  [true, false, true, "home", false],
)

console.log("place-types tests passed")

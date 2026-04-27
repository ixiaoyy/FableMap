import assert from "node:assert/strict"

import {
  DISCOVERABLE_PLACE_TYPES,
  derivePlaceType,
  derivePlaceTypeDisplay,
  isDiscoverablePlaceType,
  placeTypeMatchesTavern,
} from "../app/lib/place-types.js"

const convenienceTavern = {
  name: "外星便利店",
  description: "24 小时发光货架和夜班店员。",
  address: "上海市便利店街角",
  characters: [{ tags: ["外星人", "便利店", "夜班"] }],
}

const schoolTavern = {
  name: "第三中学传达室",
  description: "校门口的传达室，老师和学生都熟悉这里。",
  address: "第三中学",
  characters: [{ tags: ["门卫", "学校", "老师"] }],
}

const homeLikeTavern = {
  name: "阿璃的 Home",
  description: "只通过邀请访问的个人家。",
  address: "private home",
  characters: [{ tags: ["家庭", "家"] }],
}

assert.equal(derivePlaceType(convenienceTavern), "convenience-store", "便利店关键词应推断为 convenience-store")
assert.equal(derivePlaceType(schoolTavern), "school", "学校/中学关键词应推断为 school")
assert.equal(derivePlaceType({ name: "夜莺酒馆", characters: [] }), "tavern", "未知或酒馆内容应回退 tavern")

const cafeDisplay = derivePlaceTypeDisplay({ name: "转角咖啡", description: "咖啡师、拿铁和读书角" })
assert.equal(cafeDisplay.id, "cafe")
assert.equal(cafeDisplay.label, "咖啡店")
assert.equal(typeof cafeDisplay.icon, "string")

assert.equal(derivePlaceType(homeLikeTavern), "home", "Home 可以被识别为保留类型")
assert.equal(isDiscoverablePlaceType("home"), false, "Home 不应进入公开发现筛选")
assert.equal(DISCOVERABLE_PLACE_TYPES.some((type) => type.id === "home"), false, "公开筛选 chips 不包含 Home")

assert.equal(placeTypeMatchesTavern(convenienceTavern, "convenience-store"), true)
assert.equal(placeTypeMatchesTavern(convenienceTavern, "school"), false)

console.log("place-types tests passed")

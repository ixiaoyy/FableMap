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
assert.equal(typeof cafeDisplay.tone, "string", "地点类型应提供可展示的氛围短句")
assert.equal(typeof cafeDisplay.cardClass, "string", "地点类型应提供创建页视觉卡片样式")
assert.ok(cafeDisplay.cardClass.includes("border-"), "地点类型卡片样式应包含边框色")
assert.ok(DISCOVERABLE_PLACE_TYPES.every((type) => typeof type.tone === "string" && type.tone.length > 0), "公开地点类型都应提供氛围短句")

assert.equal(derivePlaceType(homeLikeTavern), "home", "Home 可以被识别为保留类型")
assert.equal(isDiscoverablePlaceType("home"), false, "Home 不应进入公开发现筛选")
assert.equal(DISCOVERABLE_PLACE_TYPES.some((type) => type.id === "home"), false, "公开筛选 chips 不包含 Home")

assert.equal(placeTypeMatchesTavern(convenienceTavern, "convenience-store"), true)
assert.equal(placeTypeMatchesTavern(convenienceTavern, "school"), false)


const persistedSchool = {
  place_type: "school",
  name: "夜莺酒馆",
  description: "名字像酒馆，但后端字段已经确认它是学校。",
}
assert.equal(derivePlaceType(persistedSchool), "school", "持久 place_type 应优先于关键词推断")
assert.equal(placeTypeMatchesTavern(persistedSchool, "school"), true, "筛选应使用持久 place_type")

const persistedHome = {
  place_type: "home",
  name: "公开描述里没有 home 关键词",
}
assert.equal(derivePlaceType(persistedHome), "home", "持久 Home 类型应可识别")
assert.equal(isDiscoverablePlaceType(persistedHome.place_type), false, "持久 Home 类型仍不可公开筛选")

console.log("place-types tests passed")

const PLACE_TYPE_KEYWORDS = {
  home: ["home", "家庭", "家园", "我的家", "个人家", "私宅"],
  school: ["学校", "中学", "小学", "大学", "学院", "校园", "老师", "学生", "传达室"],
  "convenience-store": ["便利店", "小卖部", "货架", "夜班", "收银台"],
  "milk-tea-shop": ["奶茶", "珍珠", "波霸", "茶饮", "果茶"],
  cafe: ["咖啡", "拿铁", "美式", "咖啡师", "读书角"],
  bookstore: ["书店", "书屋", "旧书", "书架", "阅读"],
  restaurant: ["餐馆", "餐厅", "饭店", "牛排", "食堂", "主厨", "侍者"],
  tavern: ["酒馆", "酒吧", "酒保", "吧台", "tavern", "bar"],
}

export const PLACE_TYPES = [
  {
    id: "tavern",
    label: "酒馆",
    shortLabel: "酒馆",
    icon: "🍻",
    discoverable: true,
    tone: "夜色、霓虹、吧台与旧友重逢",
    cardClass: "border-cyan-300/26 bg-cyan-300/10 text-cyan-50",
    description: "默认兼容类型，延续当前赛博酒馆主线。",
  },
  {
    id: "cafe",
    label: "咖啡店",
    shortLabel: "咖啡",
    icon: "☕",
    discoverable: true,
    tone: "白日、咖啡香、读书角与安静陪伴",
    cardClass: "border-amber-300/28 bg-amber-300/10 text-amber-50",
    description: "适合白日休闲、阅读、陪伴和轻社交氛围。",
  },
  {
    id: "milk-tea-shop",
    label: "奶茶店",
    shortLabel: "奶茶",
    icon: "🧋",
    discoverable: true,
    tone: "轻快、校园、甜味气泡与打卡感",
    cardClass: "border-pink-300/28 bg-pink-300/10 text-pink-50",
    description: "适合年轻、轻快、校园和打卡型地点。",
  },
  {
    id: "restaurant",
    label: "餐馆",
    shortLabel: "餐馆",
    icon: "🍽️",
    discoverable: true,
    tone: "正餐、仪式感、主厨故事与纪念日",
    cardClass: "border-orange-300/28 bg-orange-300/10 text-orange-50",
    description: "适合正餐、约会、庆祝和主厨叙事。",
  },
  {
    id: "convenience-store",
    label: "便利店",
    shortLabel: "便利店",
    icon: "🏪",
    discoverable: true,
    tone: "24h、夜班、街角灯箱与临时避雨",
    cardClass: "border-emerald-300/28 bg-emerald-300/10 text-emerald-50",
    description: "适合 24h、夜班、街角和社区照明场景。",
  },
  {
    id: "bookstore",
    label: "书店",
    shortLabel: "书店",
    icon: "📚",
    discoverable: true,
    tone: "旧书、书架、纸页气味与低声交谈",
    cardClass: "border-violet-300/28 bg-violet-300/10 text-violet-50",
    description: "适合安静阅读、旧书、书架和文艺场景。",
  },
  {
    id: "school",
    label: "学校",
    shortLabel: "学校",
    icon: "🏫",
    discoverable: true,
    tone: "校园、传达室、铃声与受控公共空间",
    cardClass: "border-sky-300/28 bg-sky-300/10 text-sky-50",
    description: "高隐私风险类型，仅作为受控地点语义展示。",
  },
  {
    id: "home",
    label: "Home",
    shortLabel: "Home",
    icon: "🏠",
    discoverable: false,
    reserved: true,
    tone: "私密、家庭成员、物件展示与邀请访问",
    cardClass: "border-lime-300/28 bg-lime-300/10 text-lime-50",
    description: "保留类型；默认私密，不进入公开发现筛选。",
  },
]

export const DISCOVERABLE_PLACE_TYPES = PLACE_TYPES.filter((type) => type.discoverable)

const PLACE_TYPE_BY_ID = new Map(PLACE_TYPES.map((type) => [type.id, type]))

function normalizeText(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : ""
}

function collectTagText(characters) {
  if (!Array.isArray(characters)) return []
  return characters.flatMap((character) => {
    if (!character || !Array.isArray(character.tags)) return []
    return character.tags.filter((tag) => typeof tag === "string")
  })
}

function tavernSearchText(tavern = {}) {
  const parts = [
    tavern.name,
    tavern.description,
    tavern.address,
    tavern.scene_prompt,
    ...collectTagText(tavern.characters),
  ]
  return parts.map(normalizeText).filter(Boolean).join(" ")
}

export function normalizePlaceTypeId(value) {
  const normalized = normalizeText(value).replace(/_/g, "-")
  return PLACE_TYPE_BY_ID.has(normalized) ? normalized : "tavern"
}

export function isDiscoverablePlaceType(value) {
  const type = PLACE_TYPE_BY_ID.get(normalizePlaceTypeId(value))
  return Boolean(type?.discoverable)
}

export function derivePlaceType(tavern = {}) {
  if (tavern && typeof tavern === "object" && "place_type" in tavern) {
    return normalizePlaceTypeId(tavern.place_type)
  }

  const text = tavernSearchText(tavern)
  if (!text) return "tavern"

  for (const type of PLACE_TYPES) {
    const keywords = PLACE_TYPE_KEYWORDS[type.id] || []
    if (keywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
      return type.id
    }
  }

  return "tavern"
}

export function placeTypeMatchesTavern(tavern, placeTypeId) {
  return derivePlaceType(tavern) === normalizePlaceTypeId(placeTypeId)
}

export function derivePlaceTypeDisplay(tavernOrType = {}) {
  const typeId = typeof tavernOrType === "string" ? normalizePlaceTypeId(tavernOrType) : derivePlaceType(tavernOrType)
  return PLACE_TYPE_BY_ID.get(typeId) || PLACE_TYPE_BY_ID.get("tavern")
}

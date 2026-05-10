export const HOBBY_CATEGORIES = {
  ARTS: { label: '文艺', color: 'purple', id: 'arts' },
  TECH: { label: '科技', color: 'cyan', id: 'tech' },
  NATURE: { label: '自然', color: 'green', id: 'nature' },
  ADVENTURE: { label: '探索', color: 'orange', id: 'adventure' },
  SOCIAL: { label: '社交', color: 'pink', id: 'social' },
}

export const CURATED_HOBBIES_BY_CATEGORY = {
  [HOBBY_CATEGORIES.ARTS.id]: [
    'Vinyl Records',
    'Local Folklore',
    'Ancient Languages',
    'Calligraphy',
    'Synthwave Production',
    'Diorama Building',
  ],
  [HOBBY_CATEGORIES.TECH.id]: [
    'Retro Gaming',
    'Cybernetics',
    'Mechanical Keyboards',
    'Vintage Cameras',
  ],
  [HOBBY_CATEGORIES.NATURE.id]: [
    'Gardening',
    'Bonsai',
    'Bird Watching',
    'Star Gazing',
    'Coffee Roasting',
    'Tea Ceremony',
  ],
  [HOBBY_CATEGORIES.ADVENTURE.id]: [
    'Urban Exploration',
    'Crypto-zoology',
    'Street Photography',
    'Lock Picking',
    'Post-Apocalyptic Fashion',
  ],
  [HOBBY_CATEGORIES.SOCIAL.id]: [
    'Mixology',
    'Gourmet Cooking',
    'Board Games',
    'Astrology',
  ],
}

export const CURATED_HOBBIES = Object.values(CURATED_HOBBIES_BY_CATEGORY).flat()

export function getHobbyCategory(hobby = '') {
  for (const [catId, hobbies] of Object.entries(CURATED_HOBBIES_BY_CATEGORY)) {
    if (hobbies.includes(hobby)) return HOBBY_CATEGORIES[catId.toUpperCase()]
  }
  return HOBBY_CATEGORIES.SOCIAL // Default
}

export function getHobbyIcon(hobby = '') {
  const map = {
    'Retro Gaming': '🎮',
    'Vinyl Records': '📻',
    'Local Folklore': '📜',
    'Mixology': '🍸',
    'Gardening': '🌿',
    'Gourmet Cooking': '🍳',
    'Urban Exploration': '🧭',
    'Star Gazing': '🔭',
    'Astrology': '✨',
    'Crypto-zoology': '🐉',
    'Ancient Languages': '🔤',
    'Street Photography': '📷',
    'Cybernetics': '🤖',
    'Bonsai': '🌳',
    'Mechanical Keyboards': '⌨️',
    'Coffee Roasting': '☕',
    'Tea Ceremony': '🍵',
    'Calligraphy': '🖋️',
    'Synthwave Production': '🎹',
    'Bird Watching': '🐦',
    'Board Games': '🎲',
    'Vintage Cameras': '📸',
    'Lock Picking': '🔐',
    'Diorama Building': '🏰',
    'Post-Apocalyptic Fashion': '🧥',
  }
  return map[hobby] || '✨'
}

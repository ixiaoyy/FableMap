const ATMOSPHERE_BY_TYPE = Object.freeze({
  healing_sanctum: '/place-atmosphere/atmosphere-healing.png',
  healing: '/place-atmosphere/atmosphere-healing.png',
  clinic_circle: '/place-atmosphere/atmosphere-healing.png',
  supply_outpost: '/place-atmosphere/atmosphere-supply.png',
  supply: '/place-atmosphere/atmosphere-supply.png',
  transit_node: '/place-atmosphere/atmosphere-transit.png',
  transit: '/place-atmosphere/atmosphere-transit.png',
  judgement_tower: '/place-atmosphere/atmosphere-judgement.png',
  judgement: '/place-atmosphere/atmosphere-judgement.png',
  order_bureau: '/place-atmosphere/atmosphere-judgement.png',
  ember_parlor: '/place-atmosphere/atmosphere-ember.png',
  ember: '/place-atmosphere/atmosphere-ember.png',
  lobby: '/place-atmosphere/atmosphere-ember.png',
  lore_academy: '/place-atmosphere/atmosphere-lore.png',
  lore: '/place-atmosphere/atmosphere-lore.png',
  archive_stack: '/place-atmosphere/atmosphere-lore.png',
  memory_collective: '/place-atmosphere/atmosphere-lore.png',
  whispering_grove: '/place-atmosphere/atmosphere-grove.png',
  grove: '/place-atmosphere/atmosphere-grove.png',
  spirit_anchor: '/place-atmosphere/atmosphere-spirit.png',
  spirit: '/place-atmosphere/atmosphere-spirit.png',
  forgotten_shrine: '/place-atmosphere/atmosphere-shrine.png',
  shrine: '/place-atmosphere/atmosphere-shrine.png',
  market_hall: '/place-atmosphere/atmosphere-market.png',
  market: '/place-atmosphere/atmosphere-market.png',
  market_gate: '/place-atmosphere/atmosphere-market.png',
})

const ATMOSPHERE_BY_LAYOUT = Object.freeze({
  lobby: '/place-atmosphere/atmosphere-ember.png',
  'quest-play': '/place-atmosphere/atmosphere-supply.png',
  'npc-chat': '/place-atmosphere/atmosphere-lore.png',
  'hybrid-room': '/place-atmosphere/atmosphere-spirit.png',
})

export const DEFAULT_ATMOSPHERE_IMAGE = '/place-atmosphere/atmosphere-ember.png'

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase().replace(/-/g, '_')
}

export function resolveTavernAtmosphereImage(tavern = {}) {
  const candidates = [
    tavern.fantasy_type,
    tavern.place?.fantasy_type,
    tavern.poi?.fantasy_type,
    tavern.place_type,
    tavern.type,
    tavern.faction_alignment,
  ]

  for (const candidate of candidates) {
    const resolved = ATMOSPHERE_BY_TYPE[normalizeKey(candidate)]
    if (resolved) return resolved
  }

  const layoutResolved = ATMOSPHERE_BY_LAYOUT[tavern.layout_style || '']
  return layoutResolved || DEFAULT_ATMOSPHERE_IMAGE
}

export function getKnownAtmosphereImages() {
  return Array.from(new Set([
    ...Object.values(ATMOSPHERE_BY_TYPE),
    ...Object.values(ATMOSPHERE_BY_LAYOUT),
    DEFAULT_ATMOSPHERE_IMAGE,
  ])).sort()
}

export const FANTASY_TYPE_TO_ICON = {
  whispering_grove: 'echo',
  healing_sanctum: 'home',
  supply_outpost: 'shop',
  judgement_tower: 'boss',
  ember_parlor: 'shop',
  lore_academy: 'quest',
  debt_cathedral: 'boss',
  feast_hall: 'shop',
  refuel_station: 'event',
  memory_archive: 'echo',
  spirit_sanctum: 'echo',
  dormant_lot: 'event',
  remedy_post: 'home',
  labor_forge: 'boss',
  contract_spire: 'boss',
}

export function getAssetIconKey(fantasyType) {
  return FANTASY_TYPE_TO_ICON[fantasyType] || null
}

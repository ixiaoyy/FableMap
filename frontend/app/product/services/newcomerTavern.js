export const NEWCOMER_TAVERN_ID = 'pw_lantern_helpdesk'
export const NEWCOMER_TAVERN_QUERY = '公益'

export function buildGuestNickname() {
  return `旅人${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

function normalizeTavernList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.taverns)) return payload.taverns
  return []
}

function isPublicOpenTavern(tavern) {
  return tavern?.access === 'public' && tavern?.status === 'open'
}

export async function resolveNewcomerTavern(tavernService, userId = '') {
  let primaryError = null
  let primaryTavern = null

  try {
    primaryTavern = await tavernService.getTavern(NEWCOMER_TAVERN_ID, userId)
    if (isPublicOpenTavern(primaryTavern)) {
      return primaryTavern
    }
    primaryError = new Error('内置公益新手酒馆当前未公开营业。')
  } catch (err) {
    primaryError = err
  }

  const payload = await tavernService.listTaverns({
    query: NEWCOMER_TAVERN_QUERY,
    access: 'public',
    status: 'open',
  })
  const candidates = normalizeTavernList(payload)
  const exactFallback = candidates.find((item) => item?.id === NEWCOMER_TAVERN_ID && isPublicOpenTavern(item))
  const publicFallback = candidates.find(isPublicOpenTavern)

  if (exactFallback || publicFallback) {
    return exactFallback || publicFallback
  }

  throw primaryError || new Error('没有找到可用的公益新手酒馆。')
}

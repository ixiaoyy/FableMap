import { jsonInit, readApiJson } from "./api-client"

export const DEFAULT_OWNER_ID = "owner-demo"
export const DEFAULT_VISITOR_ID = "visitor-demo"

export type TavernCharacter = {
  id: string
  name: string
  description?: string
  first_mes?: string
  avatar?: string
  tags?: string[]
}

export type Tavern = {
  id: string
  name: string
  description?: string
  lat: number
  lon: number
  address?: string
  access?: string
  status?: string
  owner_id?: string
  scene_prompt?: string
  visit_count?: number
  characters?: TavernCharacter[]
  world_info?: unknown[]
  gameplay_definitions?: unknown[]
}

export type TavernListResponse = {
  taverns: Tavern[]
  count: number
}

export type ChatMessage = {
  id?: string
  role: "user" | "assistant" | string
  content: string
  character_id?: string
  visitor_id?: string
  visitor_name?: string
  timestamp?: string
}

export type ChatResponse = {
  character_id: string
  character_name: string
  response: string
  degraded?: boolean
  degradation?: {
    title?: string
    message?: string
    action?: string
  } | null
  tavern_status?: string
}

function queryString(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value))
    }
  })
  const value = search.toString()
  return value ? `?${value}` : ""
}

export function listTaverns(filters: Record<string, string | number | undefined | null> = {}) {
  return readApiJson<TavernListResponse>(`/api/v1/taverns${queryString(filters)}`)
}

export function createTavern(data: Partial<Tavern> & Record<string, unknown>, userId = DEFAULT_OWNER_ID) {
  return readApiJson<Tavern>("/api/v1/taverns", jsonInit("POST", data, userId))
}

export function getTavern(tavernId: string, userId = "") {
  return readApiJson<Tavern>(`/api/v1/taverns/${encodeURIComponent(tavernId)}`, { userId })
}

export function enterTavern(tavernId: string, password = "", userId = DEFAULT_VISITOR_ID) {
  return readApiJson<{ ok: boolean; first_mes?: string; visitor_state?: unknown }>(
    `/api/v1/taverns/${encodeURIComponent(tavernId)}/enter`,
    jsonInit("POST", { password }, userId),
  )
}

export function addCharacter(tavernId: string, data: Partial<TavernCharacter>, userId = DEFAULT_OWNER_ID) {
  return readApiJson<TavernCharacter>(
    `/api/v1/taverns/${encodeURIComponent(tavernId)}/characters`,
    jsonInit("POST", data, userId),
  )
}

export function getTavernChatHistory(tavernId: string, visitorId = DEFAULT_VISITOR_ID, characterId = "") {
  return readApiJson<{ messages: ChatMessage[] }>(
    `/api/v1/taverns/${encodeURIComponent(tavernId)}/chat${queryString({
      visitor_id: visitorId,
      character_id: characterId,
    })}`,
    { userId: visitorId },
  )
}

export function sendTavernChat(
  tavernId: string,
  data: {
    character_id: string
    message: string
    visitor_id: string
    visitor_name?: string
  },
) {
  return readApiJson<ChatResponse>(
    `/api/v1/taverns/${encodeURIComponent(tavernId)}/chat`,
    jsonInit("POST", data, data.visitor_id),
  )
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error || "未知错误")
}

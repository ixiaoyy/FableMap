import { useEffect, useState } from "react"

import { FableMapHomeReference } from "../components/fable-map-reference-artboards"
import { useTheme } from "../hooks/useTheme"
import { buildHomepageView } from "../lib/homepage-taverns"
import { errorMessage, listTaverns, type TavernListResponse } from "../lib/taverns"

const HOMEPAGE_TAVERN_LIST_LIMIT = 12

const EMPTY_LIST_RESULT: TavernListResponse = { taverns: [], count: 0 }

export default function HomeRoute() {
  const [result, setResult] = useState<TavernListResponse>(EMPTY_LIST_RESULT)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const { toggleTheme } = useTheme()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError("")

    listTaverns({ limit: HOMEPAGE_TAVERN_LIST_LIMIT, offset: 0 })
      .then((data) => {
        if (!cancelled) setResult(data)
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const homepage = buildHomepageView(result, error)

  return (
    <FableMapHomeReference
      variant="black"
      featuredCitySlices={homepage.featuredCitySlices}
      isLoading={loading}
      onToggleTheme={toggleTheme}
    />
  )
}

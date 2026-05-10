import { SoulLinkDiscoverReference } from "./soul-link-reference-artboards"
import type { Tavern } from "../lib/taverns"

type DiscoverLightProps = {
  search: string
  taverns: Tavern[]
  onSearchChange: (value: string) => void
  onClear: () => void
  onTogglePlaceType: (placeTypeId: string) => void
  onToggleSpecialType: (specialTypeId: string) => void
  onToggleCategory: (label: string) => void
  onPublicOnlyChange: (value: boolean) => void
  onOpenOnlyChange: (value: boolean) => void
  onToggleTheme: () => void
}

export function DiscoverLightRealDom(props: DiscoverLightProps) {
  return <SoulLinkDiscoverReference variant="light" {...props} />
}

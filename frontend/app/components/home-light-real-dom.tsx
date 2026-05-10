import { SoulLinkHomeReference } from "./soul-link-reference-artboards"

type HomeLightRealDomProps = {
  featuredCitySlices: { id?: string; name?: string; description?: string; visit_count?: number }[]
  onToggleTheme: () => void
}

export function HomeLightRealDom(props: HomeLightRealDomProps) {
  return <SoulLinkHomeReference variant="light" {...props} />
}

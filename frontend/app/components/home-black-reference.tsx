import { SoulLinkHomeReference } from "./soul-link-reference-artboards"

type HomeBlackReferenceProps = {
  featuredCitySlices: { id?: string; name?: string; description?: string; visit_count?: number }[]
  onToggleTheme: () => void
}

export function HomeBlackReference(props: HomeBlackReferenceProps) {
  return <SoulLinkHomeReference variant="black" {...props} />
}

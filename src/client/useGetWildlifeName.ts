import { useCallback } from "react"
import { type WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
import { useLocale } from "./useLocale"
import { useShowFighters } from "./useShowFighter"

type Nameable = {
  name?: string | null
  wildlife: {
    metadata: Pick<
      WildlifeMetadata,
      "taxonLocaleNames" | "taxonCommonName" | "taxonName"
    >
  }
  fighter?: {
    species: string
  }
}

export const useGetWildlifeName = () => {
  const locale = useLocale()
  const showFighters = useShowFighters()
  const getWildlifeName = useCallback(
    (w: Nameable) => {
      if (w.name) return w.name
      if (showFighters && w.fighter?.species) {
        return w.fighter?.species
      }

      const name =
        w.wildlife.metadata.taxonLocaleNames?.[locale] ||
        w.wildlife.metadata.taxonCommonName ||
        w.wildlife.metadata.taxonName

      return name
    },
    [locale, showFighters]
  )
  return getWildlifeName
}

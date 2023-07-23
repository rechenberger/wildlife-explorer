import { useCallback } from "react"
import { type WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
import { useLocale } from "./useLocale"
import { useShowFighters } from "./useShowFighter"

type WildlifeWithMetadata = {
  metadata: Pick<
    WildlifeMetadata,
    "taxonLocaleNames" | "taxonCommonName" | "taxonName"
  >
  taxon?: {
    fighterSpeciesName?: string
  }
}

export const useGetWildlifeName = () => {
  const locale = useLocale()
  const showFighters = useShowFighters()
  const getWildlifeName = useCallback(
    (w: WildlifeWithMetadata) => {
      if (showFighters && w.taxon?.fighterSpeciesName)
        return w.taxon.fighterSpeciesName

      const name =
        w.metadata.taxonLocaleNames?.[locale] ||
        w.metadata.taxonCommonName ||
        w.metadata.taxonName

      return name
    },
    [locale, showFighters]
  )
  return getWildlifeName
}

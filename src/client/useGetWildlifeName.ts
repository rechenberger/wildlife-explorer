import { useCallback } from "react"
import { type WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
import { useLocale } from "./useLocale"

type WildlifeWithMetadata = {
  metadata: WildlifeMetadata
}

export const useGetWildlifeName = () => {
  const locale = useLocale()
  const getWildlifeName = useCallback(
    (w: WildlifeWithMetadata) => {
      return (
        w.metadata.taxonLocaleNames?.[locale] ||
        w.metadata.taxonCommonName ||
        w.metadata.taxonName
      )
    },
    [locale]
  )
  return getWildlifeName
}

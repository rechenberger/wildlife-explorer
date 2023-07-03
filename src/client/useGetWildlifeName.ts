import { useCallback } from "react"
import { type RouterOutputs } from "~/utils/api"
import { useLocale } from "./useLocale"

type WildlifeWithMetadata = Pick<
  RouterOutputs["wildlife"]["nearMe"][number],
  "metadata"
>

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

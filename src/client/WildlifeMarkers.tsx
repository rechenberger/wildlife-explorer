import { useStore } from "jotai"
import { Loader2 } from "lucide-react"
import { Fragment, memo } from "react"
import { WildlifeMarker } from "./WildlifeMarker"
import { isNavigatingAtom } from "./useActiveNavigation"
import { useWildlife } from "./useWildlife"

export const WildlifeMarkers = memo(() => {
  const { wildlife, isFetching } = useWildlife()
  const store = useStore()
  const isNavigating = store.get(isNavigatingAtom)
  WildlifeMarkers.displayName = "WildlifeMarkers"
  return (
    <Fragment>
      {isFetching && (
        <div className="absolute right-2 top-2 z-50 animate-spin text-amber-400">
          <Loader2 />
        </div>
      )}
      {wildlife?.map((w) => {
        return (
          <WildlifeMarker
            key={w.wildlife.id}
            nearMe={w}
            isNavigating={isNavigating}
          />
        )
      })}
    </Fragment>
  )
})

import { Loader2 } from "lucide-react"
import { WildlifeMarker } from "./WildlifeMarker"
import { useActiveNavigation } from "./useActiveNavigation"
import { useWildlife } from "./useWildlife"

export const WildlifeMarkers = () => {
  const { wildlife, isFetching } = useWildlife()
  const { isNavigating } = useActiveNavigation()

  return (
    <>
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
    </>
  )
}

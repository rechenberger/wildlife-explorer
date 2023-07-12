import { Loader2 } from "lucide-react"
import { WILDLIFE_REFETCH_INTERVAL_IN_MS } from "~/config"
import { api } from "~/utils/api"
import { WildlifeMarker } from "./WildlifeMarker"
import { usePlayer } from "./usePlayer"

export const useWildlife = () => {
  const { playerId } = usePlayer()
  const { data: wildlife, isFetching } = api.wildlife.nearMe.useQuery(
    {
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
      keepPreviousData: true,
      refetchInterval: WILDLIFE_REFETCH_INTERVAL_IN_MS,
    }
  )
  return {
    wildlife,
    isFetching,
  }
}

export const WildlifeMarkers = () => {
  const { wildlife, isFetching } = useWildlife()

  return (
    <>
      {isFetching && (
        <div className="absolute right-2 top-2 z-50 animate-spin text-amber-400">
          <Loader2 />
        </div>
      )}
      {wildlife?.map((w) => {
        return <WildlifeMarker key={w.id} w={w} />
      })}
    </>
  )
}

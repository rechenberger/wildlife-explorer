import { WILDLIFE_REFETCH_INTERVAL_IN_MS } from "~/config"
import { api } from "~/utils/api"
import { PlaceMarker } from "./PlaceMarker"
import { usePlayer } from "./usePlayer"

export const usePlaces = () => {
  const { playerId } = usePlayer()
  const { data: places, isFetching } = api.place.nearMe.useQuery(
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
    places,
    isFetching,
  }
}

export const PlaceMarkers = () => {
  const { places } = usePlaces()

  return (
    <>
      {places?.map((place) => {
        return <PlaceMarker key={place.id} place={place} />
      })}
    </>
  )
}

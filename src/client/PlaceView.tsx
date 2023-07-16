import { api } from "~/utils/api"
import { usePlayer } from "./usePlayer"

export const PlaceView = ({ placeId }: { placeId: string }) => {
  const { playerId } = usePlayer()
  const { data: place } = api.place.getOne.useQuery(
    { playerId: playerId!, placeId },
    { enabled: !!playerId }
  )
  // const trpc = api.useContext()

  if (!place) {
    return (
      <div className="flex items-center justify-center py-12 text-center text-sm opacity-60">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div>Wildlife Care Center</div>
        {place.metadata.name && (
          <div className="text-sm opacity-60">{place.metadata.name}</div>
        )}
      </div>
    </div>
  )
}

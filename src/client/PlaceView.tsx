import { HeartPulse } from "lucide-react"
import { api } from "~/utils/api"
import { CareButton } from "./CareButton"
import { TypeBadge } from "./TypeBadge"
import { runIcon } from "./typeIcons"
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
    <div className="flex flex-col items-center gap-4 pt-12">
      <HeartPulse className="w-8 h-8 self-center" />
      <div className="flex flex-col text-center">
        <div>Wildlife Care Center</div>
        {place.metadata.name && (
          <div className="text-sm opacity-60">{place.metadata.name}</div>
        )}
      </div>
      <CareButton />
      <div className="mt-8 flex flex-row justify-end">
        <TypeBadge
          icon={runIcon}
          content={"Leave"}
          size="big"
          onClick={() => {
            // close()
          }}
        />
      </div>
    </div>
  )
}

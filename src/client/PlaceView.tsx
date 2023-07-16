import NiceModal from "@ebay/nice-modal-react"
import { ArrowLeftRight, HeartPulse } from "lucide-react"
import { api } from "~/utils/api"
import { Away } from "./Away"
import { CareButton } from "./CareButton"
import { MyCatchesModal } from "./MyCatchesModal"
import { TypeBadge } from "./TypeBadge"
import { Button } from "./shadcn/ui/button"
import { navigateIcon, runIcon } from "./typeIcons"
import { useNavigation } from "./useNavigation"
import { usePlayer } from "./usePlayer"

export const PlaceView = ({
  placeId,
  close,
}: {
  placeId: string
  close: () => void
}) => {
  const { playerId } = usePlayer()
  const { data: place } = api.place.getOne.useQuery(
    { playerId: playerId!, placeId },
    { enabled: !!playerId }
  )

  const { navigate } = useNavigation()

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
        <Away location={place} />
      </div>
      <div className="flex flex-col gap-4">
        <CareButton />
        <Button
          onClick={() => {
            NiceModal.show(MyCatchesModal)
          }}
        >
          <ArrowLeftRight className="w-4 h-4 mr-2" />
          <span>Manage my Team</span>
        </Button>
      </div>
      <div className="mt-8 flex flex-row gap-4 w-56">
        <TypeBadge
          icon={navigateIcon}
          content={"Visit"}
          size="big"
          onClick={() => {
            navigate({
              lat: place.lat,
              lng: place.lng,
            })
          }}
          className="flex-1"
        />
        <TypeBadge
          icon={runIcon}
          content={"Leave"}
          size="big"
          onClick={() => {
            close()
          }}
          className="flex-1"
        />
      </div>
    </div>
  )
}

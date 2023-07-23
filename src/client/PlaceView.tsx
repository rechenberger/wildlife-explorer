import NiceModal from "@ebay/nice-modal-react"
import { ArrowLeftRight } from "lucide-react"
import { api } from "~/utils/api"
import { Away } from "./Away"
import { CareButton } from "./CareButton"
import { MyCatchesModal } from "./MyCatchesModal"
import { placeTypeIcons } from "./PlaceMarker"
import { TypeBadge } from "./TypeBadge"
import { Button } from "./shadcn/ui/button"
import { navigateIcon, runIcon } from "./typeIcons"
import { useNavigation } from "./useNavigation"
import { usePlayer } from "./usePlayer"

const SHOW_FLUFF = true

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
  const typeIcon = placeTypeIcons[place.type]

  return (
    <div className="flex flex-col items-center gap-4 pt-12">
      <typeIcon.icon className="w-8 h-8 self-center" />
      <div className="flex flex-col text-center">
        {SHOW_FLUFF && (
          <div className="text-sm text-gray-500 italic text-center">
            Welcome to
          </div>
        )}
        <div>{typeIcon.label}</div>
        {place.metadata.name && (
          <div className="text-sm opacity-60">{place.metadata.name}</div>
        )}
        <Away location={place} />
      </div>
      {place.type === "CARE_CENTER" && <PlaceViewWildlifeCareCenter />}
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

const PlaceViewWildlifeCareCenter = () => {
  return (
    <>
      {SHOW_FLUFF && (
        <div className="text-sm text-gray-500 italic text-center">
          This is the perfect place to rest, rejuvenate your team, and prepare
          for your next battle.
        </div>
      )}
      <div className="flex flex-col w-56">
        <CareButton />
      </div>
      {SHOW_FLUFF && (
        <div className="text-sm text-gray-500 italic text-center">
          Don&apos;t forget to manage your team and strategize by swapping
          moves.
        </div>
      )}
      <div className="flex flex-col w-56">
        <Button
          onClick={() => {
            NiceModal.show(MyCatchesModal)
          }}
        >
          <ArrowLeftRight className="w-4 h-4 mr-2" />
          <span>Manage my Team</span>
        </Button>
      </div>
      {SHOW_FLUFF && (
        <div className="text-sm text-gray-500 italic text-center">
          Remember, every battle is a step closer to becoming the ultimate
          Wildlife Explorer. Let&apos;s get ready for the next adventure!
        </div>
      )}
    </>
  )
}

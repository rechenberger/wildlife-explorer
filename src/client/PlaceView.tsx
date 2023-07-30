import { api } from "~/utils/api"
import { Away } from "./Away"
import { placeTypeIcons } from "./PlaceMarker"
import { PlaceViewAirport } from "./PlaceViewAirport"
import { PlaceViewWildlifeCareCenter } from "./PlaceViewWildlifeCareCenter"
import { TypeBadge } from "./TypeBadge"
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
  const typeIcon = placeTypeIcons[place.type]

  return (
    <div className="flex flex-col items-center gap-4 pt-12">
      <typeIcon.icon className="w-8 h-8 self-center" />
      <div className="flex flex-col text-center">
        (
        <div className="text-sm text-gray-500 italic text-center">
          Welcome to
        </div>
        )<div>{typeIcon.label}</div>
        {place.metadata.name && (
          <div className="text-sm opacity-60">{place.metadata.name}</div>
        )}
        <Away location={place} />
      </div>
      {place.type === "CARE_CENTER" && <PlaceViewWildlifeCareCenter />}
      {place.type === "AIRPORT" && <PlaceViewAirport placeId={placeId} />}
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

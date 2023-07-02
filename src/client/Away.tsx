import { useAtomValue } from "jotai"
import { RADIUS_IN_M_CATCH_WILDLIFE } from "~/config"
import { calcDistanceInMeter, type LatLng } from "~/server/lib/latLng"
import { cn } from "./cn"
import { playerLocationAtom } from "./WalkerMarker"

export const Away = ({ location }: { location: LatLng }) => {
  const playerLocation = useAtomValue(playerLocationAtom)
  const distanceInMeter = Math.ceil(
    calcDistanceInMeter(location, playerLocation)
  )
  const isClose = distanceInMeter < RADIUS_IN_M_CATCH_WILDLIFE
  return (
    <>
      <div
        className={cn(
          "text-sm font-bold text-amber-500",
          isClose && "text-green-600"
        )}
      >
        {distanceInMeter}m away
      </div>
    </>
  )
}

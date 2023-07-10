import { useAtomValue } from "jotai"
import { RADIUS_IN_M_CATCH_WILDLIFE } from "~/config"
import { calcDistanceInMeter } from "~/server/lib/latLng"
import { type LatLng } from "~/server/schema/LatLng"
import { playerLocationAtom } from "./PlayerMarker"
import { cn } from "./cn"
import { formatMeters } from "./formatMeters"

export const Away = ({
  location,
  className,
}: {
  location: LatLng
  className?: string
}) => {
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
          isClose && "text-green-600",
          className
        )}
      >
        {formatMeters(distanceInMeter)} away
      </div>
    </>
  )
}

import { useAtomValue } from "jotai"
import { calcDistanceInMeter, type LatLng } from "~/server/lib/latLng"
import { playerLocationAtom } from "./WalkerMarker"

export const Away = ({ location }: { location: LatLng }) => {
  const playerLocation = useAtomValue(playerLocationAtom)
  const distanceInMeter = Math.ceil(
    calcDistanceInMeter(location, playerLocation)
  )
  return (
    <>
      <div className="text-sm font-bold text-amber-500">
        {distanceInMeter}m away
      </div>
    </>
  )
}

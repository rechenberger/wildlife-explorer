import { useAtomValue } from "jotai"
import { filter, first, orderBy } from "lodash-es"
import { RADIUS_IN_M_CARE_CENTER } from "~/config"
import { calcDistanceInMeter } from "~/server/lib/latLng"
import { usePlaces } from "./PlaceMarkers"
import { playerLocationAtom } from "./PlayerMarker"

export const useCareCenter = () => {
  const { places } = usePlaces()
  const careCenters = filter(places, { type: "CARE_CENTER" })
  const playerLocation = useAtomValue(playerLocationAtom)

  const careCentersByDistance = orderBy(
    careCenters.map((careCenter) => {
      const distanceInMeter = calcDistanceInMeter(careCenter, playerLocation)
      return { careCenter, distanceInMeter }
    }),
    (c) => c.distanceInMeter,
    "asc"
  )

  const nearestCareCenter = first(careCentersByDistance)

  const isClose =
    nearestCareCenter &&
    nearestCareCenter?.distanceInMeter <= RADIUS_IN_M_CARE_CENTER

  return { nearestCareCenter, careCenterIsClose: isClose }
}

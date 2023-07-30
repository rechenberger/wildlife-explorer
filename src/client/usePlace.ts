import { type PlaceType } from "@prisma/client"
import { useAtomValue } from "jotai"
import { filter, first, orderBy } from "lodash-es"
import { RADIUS_IN_M_CARE_CENTER } from "~/config"
import { calcDistanceInMeter } from "~/server/lib/latLng"
import { usePlaces } from "./PlaceMarkers"
import { playerLocationAtom } from "./PlayerMarker"

export const usePlace = ({ type }: { type: PlaceType }) => {
  const { places } = usePlaces()
  const placesFiltered = filter(places, { type })
  const playerLocation = useAtomValue(playerLocationAtom)

  const placesByDistance = orderBy(
    placesFiltered.map((careCenter) => {
      const distanceInMeter = calcDistanceInMeter(careCenter, playerLocation)
      return { careCenter, distanceInMeter }
    }),
    (c) => c.distanceInMeter,
    "asc"
  )

  const nearestPlace = first(placesByDistance)

  const isClose =
    nearestPlace && nearestPlace?.distanceInMeter <= RADIUS_IN_M_CARE_CENTER

  return { nearestPlace, isClose }
}

export const useCareCenter = () => {
  const { nearestPlace, isClose } = usePlace({
    type: "CARE_CENTER",
  })

  return { nearestCareCenter: nearestPlace, careCenterIsClose: isClose }
}

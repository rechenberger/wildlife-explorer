import { orderBy, take } from "lodash-es"
import capitals from "~/data/capitals.json"
import { calcDistanceInMeter } from "~/server/lib/latLng"
import { type LatLng } from "../schema/LatLng"

export const searchCapitals = async ({ location }: { location: LatLng }) => {
  // const filtered = capitals.filter((c) => {
  //   const parseLat = parseFloat(c.CapitalLatitude)
  //   const parseLng = parseFloat(c.CapitalLongitude)
  //   if (isNaN(parseLat) || isNaN(parseLng)) {
  //     console.log("invalid lat/lng", c.CapitalName)
  //     return false
  //   }
  //   return true
  // })

  let betterCapitals = capitals.map((capital) => {
    const capitalLocation = {
      lat: +capital.CapitalLatitude,
      lng: +capital.CapitalLongitude,
    }
    const distanceInMeter = calcDistanceInMeter(location, capitalLocation)
    return {
      ...capitalLocation,
      distanceInMeter: distanceInMeter,
      name: capital.CapitalName,
      city: capital.CapitalName,
      country: capital.CountryName,
      code: capital.CountryCode,
    }
  })
  betterCapitals = orderBy(betterCapitals, (r) => r.distanceInMeter, "asc")
  return take(betterCapitals, 10)
}

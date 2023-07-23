import { orderBy, take } from "lodash-es"
import airports from "~/data/airports.json"
import { calcDistanceInMeter } from "~/server/lib/latLng"
import { type LatLng } from "../schema/LatLng"

export const searchAirports = async ({
  query,
  location,
}: {
  query?: string
  location: LatLng
}) => {
  const q = query && query.toLowerCase()
  let results = airports.filter((airport) => {
    if (!q) return true
    const name = airport.name.toLowerCase()
    const city = airport.city.toLowerCase()
    const country = airport.country.toLowerCase()
    const code = airport.code.toLowerCase()
    return (
      name.includes(q) ||
      city.includes(q) ||
      country.includes(q) ||
      code.includes(q)
    )
  })
  let betterResults = results.map((airport) => {
    const airportLocation = {
      lat: +airport.lat,
      lng: +airport.lon,
    }
    const distanceInMeter = calcDistanceInMeter(location, airportLocation)
    return {
      ...airportLocation,
      distanceInMeter: distanceInMeter,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      code: airport.code,
    }
  })
  betterResults = orderBy(betterResults, (r) => r.distanceInMeter, "asc")
  return take(betterResults, 10)
}

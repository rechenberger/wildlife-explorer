import * as turf from "@turf/turf"

export type LatLng = {
  lat: number
  lng: number
}

export const calcDistanceInMeter = (from: LatLng, to: LatLng) => {
  const fromTurf = turf.point([from.lat, from.lng])
  const toTurf = turf.point([to.lat, to.lng])
  const distanceInMeter = turf.distance(fromTurf, toTurf) * 1000 // convert to meters
  return distanceInMeter
}

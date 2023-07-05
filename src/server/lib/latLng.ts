import * as turf from "@turf/turf"
import { type LatLng } from "~/server/schema/LatLng"

export const calcDistanceInMeter = (from: LatLng, to: LatLng) => {
  const fromTurf = turf.point([from.lat, from.lng])
  const toTurf = turf.point([to.lat, to.lng])
  const distanceInMeter = turf.distance(fromTurf, toTurf) * 1000 // convert to meters
  return distanceInMeter
}

export const calculateBoundingBox = ({
  center,
  radiusInKm,
}: {
  center: LatLng
  radiusInKm: number
}) => {
  const centerPoint = turf.point([center.lng, center.lat])
  const buffered = turf.buffer(centerPoint, radiusInKm, { units: "kilometers" })
  const bbox = turf.bbox(buffered)

  return {
    minLng: bbox[0],
    minLat: bbox[1],
    maxLng: bbox[2],
    maxLat: bbox[3],
  }
}

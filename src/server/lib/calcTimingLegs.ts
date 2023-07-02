import * as polyline from "@mapbox/polyline"
import { map } from "lodash-es"
import { calcDistanceInMeter } from "./latLng"

// const geometry = "e~yuHwohi@Ff@kFpCYEgCpA}A^QzAAp@NfEHd@UJh@xF"

// FROM: https://teampilot.ai/team/tristan/chat/cljkeuv1x0001l9085ej03dxj
export const calcTimingLegs = ({
  geometry,
  totalDurationInSeconds,
  startingAtTimestamp = Date.now(),
}: {
  geometry: string
  totalDurationInSeconds: number
  startingAtTimestamp?: number
}) => {
  const decodedGeometry = polyline.decode(geometry)

  let timingLegs = [] as {
    from: { lat: number; lng: number }
    to: { lat: number; lng: number }
    durationInSeconds: number
    startingAtTimestamp: number
    distanceInMeter: number
  }[]

  // Calculate the total distance of the path in meters
  let totalDistanceInMeter = 0
  for (let i = 0; i < decodedGeometry.length - 1; i++) {
    const from = {
      lat: decodedGeometry[i]![0],
      lng: decodedGeometry[i]![1],
    }

    const to = {
      lat: decodedGeometry[i + 1]![0],
      lng: decodedGeometry[i + 1]![1],
    }

    const distanceInMeter = calcDistanceInMeter(from, to)

    totalDistanceInMeter += distanceInMeter

    timingLegs.push({
      from,
      to,
      distanceInMeter,

      // Placeholder values:
      durationInSeconds: 0,
      startingAtTimestamp: 0,
    })
  }

  let currentTimestamp = startingAtTimestamp
  timingLegs = map(timingLegs, (leg) => {
    const durationInSeconds =
      (leg.distanceInMeter / totalDistanceInMeter) * totalDurationInSeconds // distribute the total duration

    const startingAtTimestamp = currentTimestamp
    currentTimestamp += Math.floor(durationInSeconds * 1000)

    return {
      ...leg,
      durationInSeconds,
      startingAtTimestamp,
    }
  })

  return {
    timingLegs,
    totalDistanceInMeter,
  }
}

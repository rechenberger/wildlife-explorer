import * as polyline from "@mapbox/polyline"
import { findLast, first, map } from "lodash-es"
import { type PlayerMetadata } from "../schema/PlayerMetadata"
import { calcDistanceInMeter } from "./latLng"

// const geometry = "e~yuHwohi@Ff@kFpCYEgCpA}A^QzAAp@NfEHd@UJh@xF"

// FROM: https://teampilot.ai/team/tristan/chat/cljkeuv1x0001l9085ej03dxj
export const calcTimingLegs = ({
  geometry,
  totalDurationInSeconds,
  startingAtTimestamp = Date.now(),
  finishingAtTimestamp,
}: {
  geometry: string
  totalDurationInSeconds: number
  startingAtTimestamp: number
  finishingAtTimestamp: number
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
    finishingAtTimestamp,
  }
}

type TimingLeg = ReturnType<typeof calcTimingLegs>["timingLegs"][0]

export const calcCurrentLocation = ({
  timingLegs,
}: {
  timingLegs: TimingLeg[]
}) => {
  let nextStep = findLast(timingLegs, (leg) => {
    return leg.startingAtTimestamp < Date.now()
  })
  nextStep = nextStep || first(timingLegs)

  if (!nextStep) {
    return
  }

  // console.log(nextStep)
  const startingAtTimestamp = nextStep.startingAtTimestamp
  const durationInSeconds = nextStep.durationInSeconds
  const now = Date.now()
  let progress = (now - startingAtTimestamp) / (durationInSeconds * 1000)
  if (progress > 1) {
    return nextStep.to
  }
  progress = Math.min(Math.max(progress, 0), 1)

  const lat =
    nextStep.from.lat + (nextStep.to.lat - nextStep.from.lat) * progress
  const lng =
    nextStep.from.lng + (nextStep.to.lng - nextStep.from.lng) * progress

  // TODO: find out when and why this happens
  if (isNaN(lat) || isNaN(lng)) {
    console.error("lat or lng is NaN", { lat, lng })
    return null
  }

  return { lat, lng }
}

export const calcPlayerCurrentLocation = ({
  player,
}: {
  player: {
    metadata: PlayerMetadata
  }
}) => {
  const navigation = player.metadata?.navigation
  if (!navigation) {
    return null
  }
  const { timingLegs } = calcTimingLegs(navigation)
  const currentLocation = calcCurrentLocation({ timingLegs })
  return currentLocation
}

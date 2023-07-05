import { z } from "zod"
import { LatLng } from "./LatLng"

export const PlayerNavigation = z.object({
  start: LatLng,
  finish: LatLng,
  startingAtTimestamp: z.number(),
  finishingAtTimestamp: z.number(),
  geometry: z.string(),
  totalDurationInSeconds: z.number(),
  totalDistanceInMeter: z.number(),
})
export type PlayerNavigation = z.infer<typeof PlayerNavigation>

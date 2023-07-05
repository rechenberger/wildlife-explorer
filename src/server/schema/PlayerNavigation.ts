import { z } from "zod"
import { LatLng } from "./LatLng"

export const PlayerNavigation = z.object({
  start: LatLng,
  finish: LatLng,
  startingAtTimestamp: z.number(),
  finishingAtTimestamp: z.number(),
  totalDurationInSeconds: z.number(),
  geometry: z.string(),
})
export type PlayerNavigation = z.infer<typeof PlayerNavigation>

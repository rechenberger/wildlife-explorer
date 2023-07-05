import { z } from "zod"
import { PlayerNavigation } from "./PlayerNavigation"

export const PlayerMetadata = z.object({
  navigation: PlayerNavigation.nullish(),
})
export type PlayerMetadata = z.infer<typeof PlayerMetadata>

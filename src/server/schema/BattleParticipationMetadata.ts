import { z } from "zod"

export const BattleParticipationMetadata = z.object({
  isPlaceEncounter: z.boolean().optional(),
  startWithCatchId: z.string().optional(),
})
export type BattleParticipationMetadata = z.infer<
  typeof BattleParticipationMetadata
>

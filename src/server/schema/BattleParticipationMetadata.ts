import { z } from "zod"

export const BattleParticipationMetadata = z.object({
  isPlaceEncounter: z.boolean().optional(),
})
export type BattleParticipationMetadata = z.infer<
  typeof BattleParticipationMetadata
>

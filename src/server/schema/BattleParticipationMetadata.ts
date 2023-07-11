import { z } from "zod"

export const BattleParticipationMetadata = z.object({
  nextChoice: z.string().nullish(),
})
export type BattleParticipationMetadata = z.infer<
  typeof BattleParticipationMetadata
>

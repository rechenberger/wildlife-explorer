import { z } from "zod"

export const BattleParticipationMetadata = z.object({})
export type BattleParticipationMetadata = z.infer<
  typeof BattleParticipationMetadata
>

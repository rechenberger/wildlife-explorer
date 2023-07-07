import { z } from "zod"

export const BattleMetadata = z.object({
  // inputLog: z.array(z.string()).nullish(),
  battleJson: z.any().nullish(),
})
export type BattleMetadata = z.infer<typeof BattleMetadata>

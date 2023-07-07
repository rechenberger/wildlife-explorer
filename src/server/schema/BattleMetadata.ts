import { z } from "zod"

export const BattleMetadata = z.object({
  inputLog: z.array(z.string()).nullish(),
})
export type BattleMetadata = z.infer<typeof BattleMetadata>

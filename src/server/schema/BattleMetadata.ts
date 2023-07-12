import { z } from "zod"
import { BattleReport } from "../lib/battle/BattleReport"

export const BattleMetadata = z.object({
  // inputLog: z.array(z.string()).nullish(),
  battleJson: z.any().nullish(),
  battleReport: BattleReport.nullish(),
  battleInput: z
    .any()
    // .transform((battleInput) => battleInput as BattleInput)
    .nullish(),
})
export type BattleMetadata = z.infer<typeof BattleMetadata>

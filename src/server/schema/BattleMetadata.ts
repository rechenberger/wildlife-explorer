import { z } from "zod"

export const BattleMetadata = z.object({})
export type BattleMetadata = z.infer<typeof BattleMetadata>

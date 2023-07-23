import { z } from "zod"

export const TradeMetadata = z.object({
  playerAccept: z.record(z.boolean()).nullish(),
  playerCatches: z.record(z.array(z.string())).nullish(),
})
export type TradeMetadata = z.infer<typeof TradeMetadata>

import { z } from "zod"

export const TradeMetadata = z.object({
  playerAccept: z.record(z.boolean()).nullish(),
})
export type TradeMetadata = z.infer<typeof TradeMetadata>

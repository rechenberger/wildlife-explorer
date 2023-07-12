import { z } from "zod"
import { createTRPCRouter } from "~/server/api/trpc"
import { playerProcedure } from "../middleware/playerProcedure"

export const tradeRouter = createTRPCRouter({
  startTrade: playerProcedure
    .input(
      z.object({
        otherPlayerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      //
    }),

  acceptTrade: playerProcedure
    .input(
      z.object({
        tradeId: z.string(),
        accept: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      //
    }),
})

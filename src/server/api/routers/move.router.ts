import { z } from "zod"
import { createTRPCRouter } from "~/server/api/trpc"
import { getWildlifeFighterPlus } from "~/server/lib/battle/getWildlifeFighterPlus"
import { playerProcedure } from "../middleware/playerProcedure"

export const moveRouter = createTRPCRouter({
  getPossibleMoves: playerProcedure
    .input(
      z.object({
        catchId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const c = await ctx.prisma.catch.findFirstOrThrow({
        where: {
          id: input.catchId,
          playerId: ctx.player.id,
        },
        include: {
          wildlife: true,
        },
      })
      const fighter = await getWildlifeFighterPlus(c)
      // const x = await
    }),
})

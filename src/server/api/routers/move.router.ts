import { findIndex, orderBy } from "lodash-es"
import { z } from "zod"
import { createTRPCRouter } from "~/server/api/trpc"
import { getWildlifeFighterPlusMove } from "~/server/lib/battle/WildlifeFighterPlusMove"
import { getMovesInLearnset } from "~/server/lib/battle/getWildlifeFighter"
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
      const learnsetMoves = await getMovesInLearnset(fighter.species)
      let allMoves = learnsetMoves.map((move) => {
        const movePlus = getWildlifeFighterPlusMove({
          move: move.move,
        })
        let activeIdx: number | null = findIndex(
          fighter.moves,
          (m) => m.id === movePlus.id
        )
        activeIdx = activeIdx === -1 ? null : activeIdx
        const learnAtLevel = move.level
        const learned = fighter.level >= learnAtLevel

        return {
          ...movePlus,
          activeIdx,
          learnAtLevel,
          learned,
        }
      })

      allMoves = orderBy(allMoves, (m) => m.learnAtLevel)

      return allMoves
    }),
})

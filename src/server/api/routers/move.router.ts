import { TRPCError } from "@trpc/server"
import { findIndex, orderBy } from "lodash-es"
import { z } from "zod"
import { SHOW_FUTURE_MOVES } from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { type MyPrismaClient } from "~/server/db"
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
      return getPossibleMoves({
        prisma: ctx.prisma,
        catchId: input.catchId,
        playerId: ctx.player.id,
      })
    }),
  swap: playerProcedure
    .input(
      z.object({
        catchId: z.string(),
        slotIdx: z.number(),
        moveId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const allMoves = await getPossibleMoves({
        prisma: ctx.prisma,
        catchId: input.catchId,
        playerId: ctx.player.id,
      })
      const move = allMoves.find((m) => m.id === input.moveId)
      if (!move) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Move not found",
        })
      }
      if (!move.learned) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Move not learned",
        })
      }
    }),
})

const getPossibleMoves = async ({
  prisma,
  catchId,
  playerId,
}: {
  prisma: MyPrismaClient
  catchId: string
  playerId: string
}) => {
  const c = await prisma.catch.findFirstOrThrow({
    where: {
      id: catchId,
      playerId,
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
  if (!SHOW_FUTURE_MOVES) {
    allMoves = allMoves.filter((m) => m.learned)
  }
  return allMoves
}

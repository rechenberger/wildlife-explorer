import { TRPCError } from "@trpc/server"
import { filter, findIndex, orderBy } from "lodash-es"
import { z } from "zod"
import { MAX_MOVES_PER_FIGHTER, SHOW_FUTURE_MOVES } from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { type MyPrismaClient } from "~/server/db"
import { getWildlifeFighterPlusMove } from "~/server/lib/battle/WildlifeFighterPlusMove"
import { getMovesInLearnset } from "~/server/lib/battle/getWildlifeFighter"
import { getWildlifeFighterPlus } from "~/server/lib/battle/getWildlifeFighterPlus"
import { CatchMetadata } from "~/server/schema/CatchMetadata"
import { playerProcedure } from "../middleware/playerProcedure"

export const moveRouter = createTRPCRouter({
  getPossibleMoves: playerProcedure
    .input(
      z.object({
        catchId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { allMoves } = await getPossibleMoves({
        prisma: ctx.prisma,
        catchId: input.catchId,
        playerId: ctx.player.id,
      })
      return allMoves
    }),
  swap: playerProcedure
    .input(
      z.object({
        catchId: z.string(),
        oldMoveId: z.string(),
        newMoveId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { allMoves, c } = await getPossibleMoves({
        prisma: ctx.prisma,
        catchId: input.catchId,
        playerId: ctx.player.id,
      })
      if (filter(allMoves, (m) => m.learned).length < MAX_MOVES_PER_FIGHTER) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Move Swap will be available after learning your ${
            MAX_MOVES_PER_FIGHTER + 1
          }th move`,
        })
      }

      const newMove = allMoves.find((m) => m.id === input.newMoveId)
      if (!newMove) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "New move not found",
        })
      }
      if (!newMove.learned) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "New move not learned",
        })
      }

      const oldMove = allMoves.find((m) => m.id === input.oldMoveId)
      if (!oldMove) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Old move not found",
        })
      }
      if (oldMove.activeIdx === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Old move not active",
        })
      }

      const currentMoves = orderBy(
        allMoves.filter((m) => m.activeIdx !== null),
        (m) => m.activeIdx
      )
      currentMoves[oldMove.activeIdx] = newMove

      if (typeof newMove.activeIdx === "number") {
        currentMoves[newMove.activeIdx] = oldMove
      }

      const moves = currentMoves.map((m) => ({
        id: m.id,
        pp: m.status?.pp || m.definition.pp,
      }))

      await ctx.prisma.catch.update({
        where: {
          id: c.id,
        },
        data: {
          metadata: {
            ...c.metadata,
            moves,
          } satisfies CatchMetadata,
        },
      })
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

  allMoves = orderBy(allMoves, [(m) => m.activeIdx, (m) => m.learnAtLevel])
  if (!SHOW_FUTURE_MOVES) {
    allMoves = allMoves.filter((m) => m.learned)
  }
  return { allMoves, c }
}

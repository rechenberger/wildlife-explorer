import { Dex } from "@pkmn/dex"
import { TRPCError } from "@trpc/server"
import { filter } from "lodash-es"
import { z } from "zod"
import { createTRPCRouter } from "~/server/api/trpc"
import { type MyPrismaClient } from "~/server/db"
import {
  getPossibleMovesByCatch,
  getPossibleMovesByCatchId,
} from "~/server/lib/battle/getPossibleMoves"
import {
  getNextEvo,
  isEvoPossible,
} from "~/server/lib/battle/getWildlifeFighter"
import { getWildlifeFighterPlus } from "~/server/lib/battle/getWildlifeFighterPlus"
import { type CatchMetadata } from "~/server/schema/CatchMetadata"
import { playerProcedure } from "../middleware/playerProcedure"

export const evolutionRouter = createTRPCRouter({
  evolve: playerProcedure
    .input(z.object({ catchId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const nextEvo = await getNextEvolution({
        catchId: input.catchId,
        playerId: ctx.player.id,
        prisma: ctx.prisma,
      })
      if (!nextEvo || !nextEvo.canEvolve) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This wildlife cannot evolve",
        })
      }
      await ctx.prisma.catch.update({
        where: {
          id: input.catchId,
        },
        data: {
          metadata: {
            ...nextEvo.evolvedMetadata,
          } satisfies CatchMetadata,
        },
      })
    }),

  getPreview: playerProcedure
    .input(z.object({ catchId: z.string() }))
    .query(async ({ ctx, input }) => {
      const nextEvo = await getNextEvolution({
        catchId: input.catchId,
        playerId: ctx.player.id,
        prisma: ctx.prisma,
      })
      if (!nextEvo) return null
      const { oldMoves, newMoves, evoConditionLabel } = nextEvo
      const realNewMoves = newMoves.filter(
        (m) => !oldMoves.find((om) => !!om.learned && om.id === m.id)
      )

      return {
        realNewMoves,
        evoConditionLabel,
      }
    }),
})

const getNextEvolution = async ({
  catchId,
  playerId,
  prisma,
}: {
  catchId: string
  playerId: string
  prisma: MyPrismaClient
}) => {
  const { c: catchToEvolve, allMoves: oldMoves } =
    await getPossibleMovesByCatchId({
      catchId: catchId,
      playerId: playerId,
      prisma: prisma,
    })

  const fighter = await getWildlifeFighterPlus(catchToEvolve)

  const nextEvo = getNextEvo({
    species: Dex.species.get(fighter.species),
    // level: fighter.level,
  })
  if (!nextEvo) return null

  const canEvolve = isEvoPossible({
    isTraded: catchToEvolve.originalPlayerId !== catchToEvolve.playerId,
    level: fighter.level,
    nextEvo,
  })

  const evoConditionLabel =
    nextEvo.evoType === "trade"
      ? "Trade"
      : nextEvo.evoLevel
      ? `Level ${nextEvo.evoLevel}`
      : "Unknown"

  const movesLearned = filter(oldMoves, (m) => !!m.learned).map((m) => m.id)
  const evolvedMetadata = {
    ...catchToEvolve.metadata,
    speciesNum: nextEvo.num,
    speciesName: nextEvo.name,
    movesLearned: movesLearned,
  } satisfies CatchMetadata

  const { allMoves: newMoves } = await getPossibleMovesByCatch({
    c: {
      ...catchToEvolve,
      metadata: evolvedMetadata,
    },
  })

  return {
    evolvedMetadata,
    oldMoves,
    newMoves,
    canEvolve,
    evoConditionLabel,
  }
}

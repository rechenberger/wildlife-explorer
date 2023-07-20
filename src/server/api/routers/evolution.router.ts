import { Dex } from "@pkmn/dex"
import { TRPCError } from "@trpc/server"
import { filter } from "lodash-es"
import { z } from "zod"
import { createTRPCRouter } from "~/server/api/trpc"
import { getPossibleMovesByCatch } from "~/server/lib/battle/getPossibleMoves"
import { getNextPossibleEvoByLevel } from "~/server/lib/battle/getWildlifeFighter"
import { getWildlifeFighterPlus } from "~/server/lib/battle/getWildlifeFighterPlus"
import { type CatchMetadata } from "~/server/schema/CatchMetadata"
import { playerProcedure } from "../middleware/playerProcedure"

export const evolutionRouter = createTRPCRouter({
  evolve: playerProcedure
    .input(z.object({ catchId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const catchToEvolve = await ctx.prisma.catch.findUniqueOrThrow({
        where: {
          id: input.catchId,
        },
        include: {
          wildlife: true,
        },
      })

      const fighter = await getWildlifeFighterPlus(catchToEvolve)

      const nextPossibleEvo = getNextPossibleEvoByLevel({
        species: Dex.species.get(fighter.species),
        level: fighter.level,
      })

      const canEvolve = !!nextPossibleEvo
      if (!canEvolve) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Wildlife cannot evolve",
        })
      }

      const { allMoves: oldMoves } = await getPossibleMovesByCatch({
        c: catchToEvolve,
      })
      const movesLearned = filter(oldMoves, (m) => !!m.learned).map((m) => m.id)
      const evolvedMetadata = {
        ...catchToEvolve.metadata,
        speciesNum: nextPossibleEvo.num,
        speciesName: nextPossibleEvo.name,
        movesLearned: movesLearned,
      } satisfies CatchMetadata

      // const newMoves = getPossibleMovesByCatch({
      //   c: {
      //     ...catchToEvolve,
      //     metadata: evolvedMetadata,
      //   },
      // })

      await ctx.prisma.catch.update({
        where: {
          id: input.catchId,
        },
        data: {
          metadata: {
            ...evolvedMetadata,
          } satisfies CatchMetadata,
        },
      })
    }),
})

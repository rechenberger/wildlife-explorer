import { Dex } from "@pkmn/dex"
import { TRPCError } from "@trpc/server"
import { filter, map } from "lodash-es"
import { z } from "zod"
import { createTRPCRouter } from "~/server/api/trpc"
import {
  getMovesInLearnset,
  getNextPossibleEvoByLevel,
} from "~/server/lib/battle/getWildlifeFighter"
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

      const evolvedMetadata = {
        ...catchToEvolve.metadata,
        speciesNum: nextPossibleEvo.num,
        speciesName: nextPossibleEvo.name,
      } satisfies CatchMetadata

      const fighterEvolved = await getWildlifeFighterPlus({
        ...catchToEvolve,
        metadata: evolvedMetadata,
      })

      const evolvedMoves = await getMovesInLearnset(nextPossibleEvo.name)

      const evolvedMovesInLevelRange = filter(
        evolvedMoves,
        (m) => m.level <= fighterEvolved.level
      )

      const evolvedMoveIds = map(evolvedMovesInLevelRange, (m) => m.move)
      const fighterMovesWithoutUnknown = filter(
        catchToEvolve.metadata.moves,
        (m) => evolvedMoveIds.includes(m.id)
      )

      let moves = fighterMovesWithoutUnknown
      if (!moves.length) {
        // TODO: fill in with latest moves
        throw new TRPCError({
          code: "CONFLICT",
          message: "No moves for evolved wildlife",
        })
      }

      await ctx.prisma.catch.update({
        where: {
          id: input.catchId,
        },
        data: {
          metadata: {
            ...evolvedMetadata,
            moves,
          } satisfies CatchMetadata,
        },
      })
    }),
})
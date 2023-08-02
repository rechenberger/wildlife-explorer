import { TRPCError } from "@trpc/server"
import { first } from "lodash-es"
import { z } from "zod"
import { RADIUS_IN_M_CATCH_WILDLIFE } from "~/config"
import { calcDistanceInMeter } from "~/server/lib/latLng"
import { playerProcedure } from "./playerProcedure"

export const wildlifeProcedure = playerProcedure
  .input(z.object({ wildlifeId: z.string().min(1) }))
  .use(async ({ ctx, next, input }) => {
    const wildlife = await ctx.prisma.wildlife.findUnique({
      where: {
        id: input.wildlifeId,
      },
      include: {
        catches: {
          where: {
            originalPlayerId: ctx.player.id,
          },
        },
        battleParticipations: {
          where: {
            battle: {
              status: "IN_PROGRESS",
            },
          },
          select: {
            battleId: true,
          },
        },
        taxon: {
          select: {
            fighterSpeciesName: true,
          },
        },
      },
    })
    if (!wildlife) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No observation found",
      })
    }
    const distanceInMeter = calcDistanceInMeter(wildlife, ctx.player)
    const isClose = distanceInMeter < RADIUS_IN_M_CATCH_WILDLIFE
    if (!isClose) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Too far away 😫",
      })
    }

    if (wildlife.respawnsAt > new Date()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Wildlife respawns soon™️",
      })
    }

    const caught = wildlife.catches.length > 0
    if (caught) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Wildlife already caught 🤓",
      })
    }

    const wildlifeBattleId = first(wildlife.battleParticipations)?.battleId

    return next({
      ctx: {
        ...ctx,
        wildlife,
        wildlifeBattleId,
      },
    })
  })

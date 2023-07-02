import { TRPCError } from "@trpc/server"
import { addMinutes } from "date-fns"
import { z } from "zod"
import {
  DEFAULT_CATCH_SUCCESS_RATE,
  DEFAULT_RESPAWN_TIME_IN_MINUTES,
  RADIUS_IN_M_CATCH_WILDLIFE,
} from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { calcDistanceInMeter } from "~/server/lib/latLng"
import { playerProcedure } from "../middleware/playerProcedure"

export const catchRouter = createTRPCRouter({
  getMyCatches: playerProcedure.query(async ({ ctx }) => {
    const catches = await ctx.prisma.catch.findMany({
      where: {
        playerId: ctx.player.id,
      },
    })
    return catches
  }),

  catch: playerProcedure
    .input(
      z.object({
        observationId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const wildlife = await ctx.prisma.wildlife.findUnique({
        where: {
          observationId: input.observationId,
        },
        include: {
          catches: {
            where: {
              playerId: ctx.player.id,
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
        return {
          success: false,
          reason: "Too far away 😫",
        }
      }

      if (wildlife.respawnsAt > new Date()) {
        return {
          success: false,
          reason: "Wildlife respawns soon™️",
        }
      }

      const caught = wildlife.catches.length > 0
      if (caught) {
        return {
          success: false,
          reason: "Wildlife already caught 🤓",
        }
      }

      const luck = Math.random()
      const isLucky = luck > DEFAULT_CATCH_SUCCESS_RATE

      const respawnsAt = addMinutes(new Date(), DEFAULT_RESPAWN_TIME_IN_MINUTES)
      await ctx.prisma.wildlife.update({
        where: {
          id: wildlife.id,
        },
        data: {
          respawnsAt,
        },
      })

      if (!isLucky) {
        return {
          success: false,
          reason: "Wildlife escaped 💨",
        }
      }

      await ctx.prisma.catch.create({
        data: {
          playerId: ctx.player.id,
          wildlifeId: wildlife.id,
        },
      })

      return {
        success: true,
      }
    }),
})

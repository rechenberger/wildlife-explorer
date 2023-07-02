import { TRPCError } from "@trpc/server"
import { addMinutes } from "date-fns"
import { z } from "zod"
import {
  DEFAULT_CATCH_SUCCESS_RATE,
  DEFAULT_RESPAWN_TIME_IN_MINUTES,
  RADIUS_IN_KM_SEE_WILDLIFE,
  RADIUS_IN_M_CATCH_WILDLIFE,
} from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { findWildlife } from "~/server/lib/findWildlife"
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
      const observations = await findWildlife({
        lat: ctx.player.lat,
        lng: ctx.player.lng,
        radiusInKm: RADIUS_IN_KM_SEE_WILDLIFE,
        prisma: ctx.prisma,
        playerId: ctx.player.id,
      })
      const observation = observations.find(
        (observation) => observation.id === input.observationId
      )
      if (!observation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No observation found",
        })
      }
      const distanceInMeter = calcDistanceInMeter(observation, ctx.player)
      const isClose = distanceInMeter < RADIUS_IN_M_CATCH_WILDLIFE
      if (!isClose) {
        return {
          success: false,
          reason: "Too far away 😫",
        }
      }

      if (
        observation.status?.respawnsAt &&
        observation.status.respawnsAt > new Date()
      ) {
        return {
          success: false,
          reason: "Wildlife respawns soon™️",
        }
      }

      const caught = await ctx.prisma.catch.findFirst({
        where: {
          observationId: observation.id,
          playerId: ctx.player.id,
        },
      })
      if (caught) {
        return {
          success: false,
          reason: "Wildlife already caught 🤓",
        }
      }

      const luck = Math.random()
      const isLucky = luck > DEFAULT_CATCH_SUCCESS_RATE

      const respawnsAt = addMinutes(new Date(), DEFAULT_RESPAWN_TIME_IN_MINUTES)

      await ctx.prisma.observationStatus.upsert({
        where: {
          id: observation.id,
        },
        update: {
          respawnsAt,
        },
        create: {
          id: observation.id,
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
          observationId: observation.id,
        },
      })

      return {
        success: true,
      }
    }),
})

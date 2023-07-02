import { TRPCError } from "@trpc/server"
import { z } from "zod"
import {
  DEFAULT_CATCH_SUCCESS_RATE,
  RADIUS_IN_KM_SEE_WILDLIFE,
  RADIUS_IN_M_CATCH_WILDLIFE,
} from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { findObservations } from "~/server/inaturalist/findObservations"
import { calcDistanceInMeter } from "~/server/lib/latLng"
import { playerProcedure } from "../middleware/playerProcedure"

export const catchRouter = createTRPCRouter({
  catch: playerProcedure
    .input(
      z.object({
        observationId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const observations = await findObservations({
        lat: ctx.player.lat,
        lng: ctx.player.lng,
        radiusInKm: RADIUS_IN_KM_SEE_WILDLIFE,
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
          reason: "too far away",
        }
      }

      const luck = Math.random()
      const isLucky = luck > DEFAULT_CATCH_SUCCESS_RATE

      if (!isLucky) {
        return {
          success: false,
          reason: "Wildlife escaped",
        }
      }

      await ctx.prisma.catched.create({
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

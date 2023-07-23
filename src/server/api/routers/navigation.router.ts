import MapboxClient from "@mapbox/mapbox-sdk/services/directions"
import { TRPCError } from "@trpc/server"
import { first } from "lodash-es"
import { z } from "zod"
import {
  GLOBAL_REALTIME_MULTIPLIER,
  MAX_METER_BY_BICYCLE,
  MAX_METER_BY_FOOT,
} from "~/config"
import { env } from "~/env.mjs"
import { createTRPCRouter } from "~/server/api/trpc"
import { calcTimingLegs } from "~/server/lib/calcTimingLegs"
import { calcDistanceInMeter } from "~/server/lib/latLng"
import { LatLng } from "~/server/schema/LatLng"
import { type PlayerMetadata } from "~/server/schema/PlayerMetadata"
import { type PlayerNavigation } from "~/server/schema/PlayerNavigation"
import { playerProcedure } from "../middleware/playerProcedure"

const baseClient = MapboxClient({ accessToken: env.NEXT_PUBLIC_MAPBOX_TOKEN })

export const navigationRouter = createTRPCRouter({
  startNavigation: playerProcedure
    .input(
      z.object({
        to: LatLng,
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.player.metadata?.activeBattleId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot start navigation while in a battle",
        })
      }

      const start = {
        lat: ctx.player.lat,
        lng: ctx.player.lng,
      }

      // Save start location (in case of a crash)
      await ctx.prisma.player.update({
        where: { id: ctx.player.id },
        data: {
          ...start,
        },
      })

      const finish = input.to
      const beeLineDistance = calcDistanceInMeter(start, finish)
      const travelingBy =
        beeLineDistance <= MAX_METER_BY_FOOT
          ? "walking"
          : beeLineDistance <= MAX_METER_BY_BICYCLE
          ? "cycling"
          : "driving"

      const response = await baseClient
        .getDirections({
          profile: travelingBy,
          waypoints: [
            {
              coordinates: [start.lng, start.lat],
            },
            {
              coordinates: [finish.lng, finish.lat],
            },
          ],
        })
        .send()

      const directions = response.body

      const route = first(directions.routes)
      if (!route) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No route found",
        })
      }

      const startingAtTimestamp = Date.now()
      const totalDurationInSeconds = route.duration / GLOBAL_REALTIME_MULTIPLIER
      const finishingAtTimestamp =
        startingAtTimestamp + totalDurationInSeconds * 1000

      const navigation = {
        start,
        finish,
        startingAtTimestamp,
        finishingAtTimestamp,
        geometry: route.geometry,
        totalDurationInSeconds,
        totalDistanceInMeter: 0,
        travelingBy,
      } satisfies PlayerNavigation

      const { timingLegs, totalDistanceInMeter } = calcTimingLegs(navigation)
      navigation.totalDistanceInMeter = totalDistanceInMeter

      if (totalDistanceInMeter <= 1 || totalDurationInSeconds <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already at your destination",
        })
      }

      await ctx.prisma.player.update({
        where: { id: ctx.player.id },
        data: {
          metadata: {
            ...ctx.player.metadata,
            navigation,
          } satisfies PlayerMetadata,
        },
      })

      return {
        timingLegs,
        totalDistanceInMeter,
        totalDurationInSeconds: route.duration,
        eta: new Date(startingAtTimestamp + totalDurationInSeconds * 1000),
      }
    }),
})

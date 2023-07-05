import MapboxClient from "@mapbox/mapbox-sdk/services/directions"
import { TRPCError } from "@trpc/server"
import { first } from "lodash-es"
import { z } from "zod"
import { GLOBAL_REALTIME_MULTIPLIER } from "~/config"
import { env } from "~/env.mjs"
import { createTRPCRouter } from "~/server/api/trpc"
import { calcTimingLegs } from "~/server/lib/calcTimingLegs"
import { LatLng } from "~/server/schema/LatLng"
import { PlayerMetadata } from "~/server/schema/PlayerMetadata"
import { type PlayerNavigation } from "~/server/schema/PlayerNavigation"
import { playerProcedure } from "../middleware/playerProcedure"

const baseClient = MapboxClient({ accessToken: env.NEXT_PUBLIC_MAPBOX_TOKEN })

export const navigationRouter = createTRPCRouter({
  calcNavigation: playerProcedure
    .input(
      z.object({
        to: LatLng,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const start = {
        lat: ctx.player.lat,
        lng: ctx.player.lng,
      }
      const finish = input.to
      const response = await baseClient
        .getDirections({
          profile: "driving", // Use 'walking' profile for pedestrian routes.
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
      } satisfies PlayerNavigation

      const { timingLegs, totalDistanceInMeter } = calcTimingLegs(navigation)
      navigation.totalDistanceInMeter = totalDistanceInMeter

      await ctx.prisma.player.update({
        where: { id: ctx.player.id },
        data: {
          metadata: {
            ...PlayerMetadata.parse(ctx.player.metadata),
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

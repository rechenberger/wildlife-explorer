import MapboxClient from "@mapbox/mapbox-sdk/services/directions"
import { TRPCError } from "@trpc/server"
import { first } from "lodash-es"
import { z } from "zod"
import { GLOBAL_REALTIME_MULTIPLIER } from "~/config"
import { env } from "~/env.mjs"
import { createTRPCRouter } from "~/server/api/trpc"
import { calcTimingLegs } from "~/server/lib/calcTimingLegs"
import { PlayerMetadata } from "~/server/schema/PlayerMetadata"
import { playerProcedure } from "../middleware/playerProcedure"

const baseClient = MapboxClient({ accessToken: env.NEXT_PUBLIC_MAPBOX_TOKEN })

export const navigationRouter = createTRPCRouter({
  calcNavigation: playerProcedure
    .input(
      z.object({
        from: z.object({ lat: z.number(), lng: z.number() }),
        to: z.object({ lat: z.number(), lng: z.number() }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const response = await baseClient
        .getDirections({
          profile: "walking", // Use 'walking' profile for pedestrian routes.
          waypoints: [
            {
              coordinates: [input.from.lng, input.from.lat],
            },
            {
              coordinates: [input.to.lng, input.to.lat],
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

      await ctx.prisma.player.update({
        where: { id: ctx.player.id },
        data: {
          metadata: {
            ...PlayerMetadata.parse(ctx.player.metadata),
            navigation: {
              start: input.from,
              finish: input.to,
              startingAtTimestamp,
              finishingAtTimestamp,
              totalDurationInSeconds,
              geometry: route.geometry,
            },
          } satisfies PlayerMetadata,
        },
      })

      const { timingLegs, totalDistanceInMeter } = calcTimingLegs({
        geometry: route.geometry,
        totalDurationInSeconds,
        startingAtTimestamp,
      })

      return {
        timingLegs,
        totalDistanceInMeter,
        totalDurationInSeconds: route.duration,
        eta: new Date(startingAtTimestamp + totalDurationInSeconds * 1000),
      }
    }),
})

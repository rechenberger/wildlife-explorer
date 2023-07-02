import MapboxClient from "@mapbox/mapbox-sdk/services/directions"
import { TRPCError } from "@trpc/server"
import { first } from "lodash-es"
import { z } from "zod"
import { GLOBAL_REALTIME_MULTIPLIER } from "~/config"
import { env } from "~/env.mjs"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { calcTimingLegs } from "~/server/lib/calcTimingLegs"

const baseClient = MapboxClient({ accessToken: env.NEXT_PUBLIC_MAPBOX_TOKEN })

export const navigationRouter = createTRPCRouter({
  calcNavigation: publicProcedure
    .input(
      z.object({
        from: z.object({ lat: z.number(), lng: z.number() }),
        to: z.object({ lat: z.number(), lng: z.number() }),
      })
    )
    .mutation(async ({ input }) => {
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

      const totalDurationInSeconds = route.duration / GLOBAL_REALTIME_MULTIPLIER
      const { timingLegs, totalDistanceInMeter } = calcTimingLegs({
        geometry: route.geometry,
        totalDurationInSeconds,
      })

      return {
        timingLegs,
        totalDistanceInMeter,
        totalDurationInSeconds: route.duration,
      }
    }),
})

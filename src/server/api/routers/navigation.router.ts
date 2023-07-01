import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

import MapboxClient from "@mapbox/mapbox-sdk/services/directions"
import { env } from "~/env.mjs"

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
      console.log(directions)

      console.log(directions.routes[0]?.legs)
      return directions
    }),
})

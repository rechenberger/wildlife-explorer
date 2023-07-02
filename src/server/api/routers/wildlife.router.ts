import { z } from "zod"
import { RADIUS_IN_KM_SEE_WILDLIFE } from "~/config"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { findObservations } from "~/server/inaturalist/findObservations"
import { playerProcedure } from "../middleware/playerProcedure"

export const wildlifeRouter = createTRPCRouter({
  find: publicProcedure
    .input(
      z.object({ lat: z.number(), lng: z.number(), radiusInKm: z.number() })
    )
    .query(async ({ input }) => {
      return findObservations(input)
    }),

  nearMe: playerProcedure.query(async ({ ctx }) => {
    return findObservations({
      lat: ctx.player.lat,
      lng: ctx.player.lng,
      radiusInKm: RADIUS_IN_KM_SEE_WILDLIFE,
    })
  }),
})

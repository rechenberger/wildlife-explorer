import { subSeconds } from "date-fns"
import { filter, map } from "lodash-es"
import { z } from "zod"
import { RADIUS_IN_KM_SEE_WILDLIFE } from "~/config"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { findObservations } from "~/server/inaturalist/findObservations"
import { findWildlife } from "~/server/lib/findWildlife"
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
    return findWildlife({
      lat: ctx.player.lat,
      lng: ctx.player.lng,
      radiusInKm: RADIUS_IN_KM_SEE_WILDLIFE,
      prisma: ctx.prisma,
      playerId: ctx.player.id,
    })
  }),

  scan: playerProcedure.mutation(async ({ ctx }) => {
    const observations = await findObservations({
      lat: ctx.player.lat,
      lng: ctx.player.lng,
      radiusInKm: RADIUS_IN_KM_SEE_WILDLIFE,
    })

    const now = new Date()
    const wildlifes = await Promise.all(
      map(observations, async (o) => {
        const data = {
          observationId: o.observationId,
          lat: o.lat,
          lng: o.lng,
          metadata: o,
          taxonId: o.taxonId,
        }
        return await ctx.prisma.wildlife.upsert({
          where: {
            observationId: o.observationId,
          },
          create: {
            ...data,
            respawnsAt: new Date(),
            foundById: ctx.player.id,
          },
          update: data,
        })
      })
    )

    const countAll = wildlifes.length
    const countFound = filter(
      wildlifes,
      (w) => w.foundById === ctx.player.id && w.updatedAt >= subSeconds(now, 10)
    ).length

    return {
      countAll,
      countFound,
    }
  }),
})

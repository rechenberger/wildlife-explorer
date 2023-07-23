import { z } from "zod"
import { RADIUS_IN_KM_SEE_PLACES } from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { searchAirports } from "~/server/lib/airports"
import { calculateBoundingBox } from "~/server/lib/latLng"
import { playerProcedure } from "../middleware/playerProcedure"

export const placeRouter = createTRPCRouter({
  nearMe: playerProcedure.query(async ({ ctx }) => {
    // console.time("nearMe")
    const bbox = calculateBoundingBox({
      center: ctx.player,
      radiusInKm: RADIUS_IN_KM_SEE_PLACES,
    })

    const places = await ctx.prisma.place.findMany({
      where: {
        lat: {
          gte: bbox.minLat,
          lte: bbox.maxLat,
        },
        lng: {
          gte: bbox.minLng,
          lte: bbox.maxLng,
        },
      },
    })
    return places
  }),

  getOne: playerProcedure
    .input(
      z.object({
        placeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const place = await ctx.prisma.place.findUniqueOrThrow({
        where: {
          id: input.placeId,
        },
      })
      return place
    }),

  searchAirports: playerProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await searchAirports({
        query: input.query,
        location: ctx.player,
      })
    }),
})

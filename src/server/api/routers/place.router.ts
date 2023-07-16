import { RADIUS_IN_KM_SEE_PLACES } from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
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
})

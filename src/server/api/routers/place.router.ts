import { orderBy, take } from "lodash-es"
import { z } from "zod"
import { RADIUS_IN_KM_SEE_PLACES } from "~/config"
import airports from "~/data/airports.json"
import { createTRPCRouter } from "~/server/api/trpc"
import { calcDistanceInMeter, calculateBoundingBox } from "~/server/lib/latLng"
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
      const query = input.query.toLowerCase()
      let results = airports.filter((airport) => {
        const name = airport.name.toLowerCase()
        const city = airport.city.toLowerCase()
        const country = airport.country.toLowerCase()
        const code = airport.code.toLowerCase()
        return (
          name.includes(query) ||
          city.includes(query) ||
          country.includes(query) ||
          code.includes(query)
        )
      })
      let betterResults = results.map((airport) => {
        const location = {
          lat: +airport.lat,
          lng: +airport.lon,
        }
        const distance = calcDistanceInMeter(ctx.player, location)
        return {
          ...location,
          distance,
          name: airport.name,
          city: airport.city,
          country: airport.country,
          code: airport.code,
        }
      })
      betterResults = orderBy(betterResults, "distance", "asc")
      return take(betterResults, 10)
    }),
})

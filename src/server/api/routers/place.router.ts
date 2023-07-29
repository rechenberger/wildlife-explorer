import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { RADIUS_IN_KM_SEE_PLACES, RADIUS_IN_M_AIRPORT } from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { findAirportByCode, searchAirports } from "~/server/lib/airports"
import { calculateBoundingBox } from "~/server/lib/latLng"
import { type PlayerMetadata } from "~/server/schema/PlayerMetadata"
import { placeProcedure } from "../middleware/placeProcedure"
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

  flyToAirport: placeProcedure
    .input(
      z.object({
        destinationCode: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.place.type !== "AIRPORT") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Can only fly from an airport`,
        })
      }
      if (ctx.place.distanceInMeter > RADIUS_IN_M_AIRPORT) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Can only fly from an airport within ${RADIUS_IN_M_AIRPORT}m`,
        })
      }
      const airport = await findAirportByCode({ code: input.destinationCode })
      await ctx.prisma.player.update({
        where: {
          id: ctx.player.id,
        },
        data: {
          lat: airport.lat,
          lng: airport.lng,
          metadata: {
            ...ctx.player.metadata,
            navigation: null,
          } satisfies PlayerMetadata,
        },
      })
    }),
})

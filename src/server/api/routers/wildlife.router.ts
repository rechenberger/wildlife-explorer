import { type Wildlife } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import { addSeconds, subSeconds } from "date-fns"
import {
  chunk,
  filter,
  first,
  flatMap,
  map,
  orderBy,
  take,
  uniqBy,
} from "lodash-es"
import { z } from "zod"
import {
  DEFAULT_DB_CHUNK_SIZE,
  MAX_NUMBER_SEE_WILDLIFE,
  RADIUS_IN_KM_SCAN_WILDLIFE_BIG,
  RADIUS_IN_KM_SCAN_WILDLIFE_SMALL,
  RADIUS_IN_KM_SEE_WILDLIFE,
  SCAN_COOLDOWN_IN_SECONDS,
} from "~/config"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { findObservations } from "~/server/inaturalist/findObservations"
import { calcDistanceInMeter, calculateBoundingBox } from "~/server/lib/latLng"
import { WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
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
    console.time("nearMe")
    const bbox = calculateBoundingBox({
      center: ctx.player,
      radiusInKm: RADIUS_IN_KM_SEE_WILDLIFE,
    })

    let wildlifeRaw = await ctx.prisma.wildlife.findMany({
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
      include: {
        catches: {
          where: {
            playerId: ctx.player.id,
          },
        },
        foundBy: {
          select: {
            name: true,
          },
        },
      },
    })
    if (wildlifeRaw.length > MAX_NUMBER_SEE_WILDLIFE) {
      wildlifeRaw = take(
        orderBy(wildlifeRaw, (w) => calcDistanceInMeter(w, ctx.player), "asc"),
        MAX_NUMBER_SEE_WILDLIFE
      )
    }

    let wildlife = map(wildlifeRaw, (w) => {
      return {
        ...w,
        metadata: WildlifeMetadata.parse(w.metadata),
        caughtAt: first(w.catches)?.createdAt,
      }
    })
    wildlife = filter(wildlife, (w) => !w.metadata.observationIsDead)
    console.timeEnd("nearMe")
    return wildlife
  }),

  scan: playerProcedure.mutation(async ({ ctx }) => {
    if (ctx.player.scanCooldownAt && ctx.player.scanCooldownAt > new Date()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Scan is on cooldown",
      })
    }
    await ctx.prisma.player.update({
      where: {
        id: ctx.player.id,
      },
      data: {
        scanCooldownAt: addSeconds(new Date(), SCAN_COOLDOWN_IN_SECONDS),
      },
    })

    const observationsMultiRadius = await Promise.all([
      findObservations({
        lat: ctx.player.lat,
        lng: ctx.player.lng,
        radiusInKm: RADIUS_IN_KM_SCAN_WILDLIFE_SMALL,
      }),
      findObservations({
        lat: ctx.player.lat,
        lng: ctx.player.lng,
        radiusInKm: RADIUS_IN_KM_SCAN_WILDLIFE_BIG,
      }),
    ])

    const observations = uniqBy(
      flatMap(observationsMultiRadius, (o) => o),
      (o) => o.observationId
    )

    const now = new Date()
    const chunks = chunk(observations, DEFAULT_DB_CHUNK_SIZE)
    const wildlifes: Wildlife[] = []
    for (const chunk of chunks) {
      const chunkResult = await Promise.all(
        map(chunk, async (o) => {
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
      wildlifes.push(...chunkResult)
    }

    const countAll = wildlifes.length
    const countFound = filter(
      wildlifes,
      (w) => w.foundById === ctx.player.id && w.createdAt >= subSeconds(now, 10)
    ).length

    return {
      countAll,
      countFound,
    }
  }),
})

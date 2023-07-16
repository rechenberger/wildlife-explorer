import { type Wildlife } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import { addSeconds, subSeconds } from "date-fns"
import { chunk, filter, flatMap, map, uniqBy } from "lodash-es"
import {
  DEFAULT_DB_CHUNK_SIZE,
  RADIUS_IN_KM_SCAN_WILDLIFE_BIG,
  RADIUS_IN_KM_SCAN_WILDLIFE_SMALL,
  SCAN_COOLDOWN_IN_SECONDS,
} from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { findObservations } from "~/server/inaturalist/findObservations"
import { findPlaces } from "~/server/lib/findPlaces"
import { playerProcedure } from "../middleware/playerProcedure"

export const scanRouter = createTRPCRouter({
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

    const places = await findPlaces({
      location: {
        lat: ctx.player.lat,
        lng: ctx.player.lng,
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

import { filter, first, map, orderBy, take } from "lodash-es"
import { z } from "zod"
import { MAX_NUMBER_SEE_WILDLIFE, RADIUS_IN_KM_SEE_WILDLIFE } from "~/config"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { findObservations } from "~/server/inaturalist/findObservations"
import { getWildlifeFighterPlus } from "~/server/lib/battle/getWildlifeFighterPlus"
import { calcDistanceInMeter, calculateBoundingBox } from "~/server/lib/latLng"
import { createSeed } from "~/utils/seed"
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
    // console.time("nearMe")
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
            originalPlayerId: ctx.player.id,
          },
        },
        foundBy: {
          select: {
            name: true,
          },
        },
        taxon: {
          select: {
            fighterSpeciesName: true,
            // fighterSpeciesNum: true,
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

    // console.time("nearMe Fighters")
    let wildlife = await Promise.all(
      map(wildlifeRaw, async (w) => {
        return {
          wildlife: {
            ...w,
            caughtAt: first(w.catches)?.createdAt,
          },
          fighter: await getWildlifeFighterPlus({
            wildlife: w,
            seed: createSeed(w),
          }),
        }
      })
    )
    // console.timeEnd("nearMe Fighters")
    wildlife = filter(wildlife, (w) => !w.wildlife.metadata.observationIsDead)
    // console.timeEnd("nearMe")
    return wildlife
  }),

  getOne: playerProcedure
    .input(z.object({ wildlifeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const wildlife = await ctx.prisma.wildlife.findUniqueOrThrow({
        where: {
          id: input.wildlifeId,
        },
        include: {
          catches: {
            where: {
              originalPlayerId: ctx.player.id,
            },
          },
          foundBy: {
            select: {
              name: true,
            },
          },
          taxon: {
            select: {
              fighterSpeciesName: true,
              // fighterSpeciesNum: true,
            },
          },
        },
      })
      const fighter = await getWildlifeFighterPlus({
        wildlife,
        seed: createSeed(wildlife),
      })

      return {
        fighter,
        wildlife: {
          ...wildlife,
          caughtAt: first(wildlife.catches)?.createdAt,
        },
      }
    }),
})

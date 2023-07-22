import { chunk } from "lodash-es"
import { MAX_FIGHTERS_PER_TEAM } from "~/config"
import { getExpRate } from "~/data/pokemonLevelExperienceMap"
import { PokemonLevelingRate } from "~/data/pokemonLevelingRate"
import { createTRPCRouter } from "~/server/api/trpc"
import { importTaxon } from "~/server/inaturalist/importTaxon"
import { getWildlifeFighterPlus } from "~/server/lib/battle/getWildlifeFighterPlus"
import { LevelingRate, type CatchMetadata } from "~/server/schema/CatchMetadata"
import { devProcedure } from "../middleware/devProcedure"

export const migrationRouter = createTRPCRouter({
  taxons: devProcedure.mutation(async ({ ctx }) => {
    const wildlife = await ctx.prisma.wildlife.findMany({
      distinct: ["taxonId"],
      take: 10,
    })
    console.log(wildlife)
    return wildlife
  }),

  addMissingExp: devProcedure.mutation(async ({ ctx }) => {
    const catches = await ctx.prisma.catch.findMany({
      include: {
        wildlife: true,
      },
    })
    for await (const catchXX of catches) {
      const { level, exp, levelingRate } = catchXX.metadata
      if (exp) continue

      if (!level) throw new Error("no level")
      if (!levelingRate) throw new Error("no levelingRate")

      const requiredExp = getExpRate({
        level,
        levelingRate,
      })?.requiredExperience

      if (!requiredExp) throw new Error("no exp")

      await ctx.prisma.catch.update({
        where: {
          id: catchXX.id,
        },
        data: {
          metadata: {
            ...catchXX.metadata,
            exp: requiredExp,
          },
        },
      })
    }
  }),

  catchMetadata: devProcedure.mutation(async ({ ctx }) => {
    const catches = await ctx.prisma.catch.findMany({
      include: {
        wildlife: true,
      },
    })

    let i = 0
    for (const c of catches) {
      i++
      if (Object.keys(c.metadata as any).length) continue
      const wildlife = c.wildlife
      const wildlifeFighterPlus = await getWildlifeFighterPlus({
        wildlife,
        seed: c.seed,
      })

      const speciesName = wildlifeFighterPlus.species
      const speciesNum = wildlifeFighterPlus.speciesNum
      const level = wildlifeFighterPlus.level
      const levelingRate = LevelingRate.parse(
        PokemonLevelingRate[speciesNum]?.levelingRate
      )
      const baseExp = getExpRate({
        level,
        levelingRate,
      })?.requiredExperience

      const catchMetadata = {
        speciesNum,
        level,
        exp: baseExp,
        levelingRate,
        speciesName,
      } satisfies CatchMetadata

      await ctx.prisma.catch.update({
        where: {
          id: c.id,
        },
        data: {
          metadata: catchMetadata,
        },
      })
      console.log(`${i} of ${catches.length} done`)
    }
    console.log(`${i} of ${catches.length} done`)
  }),
  catchOriginalPlayer: devProcedure.mutation(async ({ ctx }) => {
    const catches = await ctx.prisma.catch.findMany({
      select: {
        id: true,
        playerId: true,
        originalPlayerId: true,
      },
    })

    let i = 0
    for (const c of catches) {
      i++
      if (c.originalPlayerId) continue

      await ctx.prisma.catch.update({
        where: {
          id: c.id,
        },
        data: {
          originalPlayerId: c.playerId,
        },
      })
      console.log(`${i} of ${catches.length} done`)
    }
    console.log(`${i} of ${catches.length} done`)
  }),

  battleOrder: devProcedure.mutation(async ({ ctx }) => {
    const players = await ctx.prisma.player.findMany({})
    for (const player of players) {
      const catches = await ctx.prisma.catch.findMany({
        where: {
          playerId: player.id,
        },
        orderBy: [
          {
            battleOrderPosition: {
              sort: "desc",
              nulls: "last",
            },
          },
          {
            createdAt: "desc",
          },
        ],
      })
      for (const [index, c] of catches.entries()) {
        await ctx.prisma.catch.update({
          where: {
            id: c.id,
          },
          data: {
            battleOrderPosition:
              index < MAX_FIGHTERS_PER_TEAM ? index + 1 : null,
          },
        })
      }
    }
  }),

  tmp: devProcedure.mutation(async ({ ctx }) => {
    await importTaxon({
      prisma: ctx.prisma,
      taxonId: 3017,
      playerId: "cljle5htl0001cf5du54abpjz",
    })
  }),

  wildlifeToTaxons: devProcedure.mutation(async ({ ctx }) => {
    const wildlife = await ctx.prisma.wildlife.findMany({
      distinct: ["taxonId"],
      orderBy: {
        createdAt: "asc",
      },
      select: {
        taxonId: true,
        metadata: true,
        foundById: true,
        createdAt: true,
      },
    })

    let done = 0
    const chunks = chunk(wildlife, 1)
    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (w) => {
          await importTaxon({
            prisma: ctx.prisma,
            taxonId: w.taxonId,
            playerId: w.foundById,
            createdAt: w.createdAt,
          })
          console.log(`${++done} of ${wildlife.length} done`)
        })
      )
    }

    return { length: wildlife.length }
  }),
})

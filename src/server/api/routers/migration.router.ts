import { MAX_FIGHTERS_PER_TEAM } from "~/config"
import { PokemonExperienceMap } from "~/data/pokemonLevelExperienceMap"
import { PokemonLevelingRate } from "~/data/pokemonLevelingRate"
import { createTRPCRouter } from "~/server/api/trpc"
import { getWildlifeFighterPlus } from "~/server/lib/battle/getWildlifeFighterPlus"
import { LevelingRate, type CatchMetadata } from "~/server/schema/CatchMetdata"
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
      const baseExp =
        PokemonExperienceMap[`${level}-${levelingRate}`]?.requiredExperience

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
})

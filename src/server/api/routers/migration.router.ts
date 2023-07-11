import { MAX_FIGHTERS_PER_TEAM } from "~/config"
import { PokemonExperienceMap } from "~/data/pokemonLevelExperienceMap"
import { PokemonLevelingRate } from "~/data/pokemonLevelingRate"
import { createTRPCRouter } from "~/server/api/trpc"
import { getWildlifeFighterPlus } from "~/server/lib/battle/getWildlifeFighterPlus"
import { CatchMetadata, LevelingRate } from "~/server/schema/CatchMetdata"
import { WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
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

    for (const c of catches) {
      const wildlife = {
        ...c.wildlife,
        metadata: WildlifeMetadata.parse(c.wildlife.metadata),
      }
      const wildlifeFighterPlus = await getWildlifeFighterPlus({
        wildlife,
        seed: c.seed,
      })

      const speciesName = wildlifeFighterPlus.species
      const speciesNum = wildlifeFighterPlus.speciesDefinition.num
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
    }
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

import { Dex, Species } from "@pkmn/dex"
import { chunk, includes, orderBy, uniqBy } from "lodash-es"
import { MAX_FIGHTERS_PER_TEAM } from "~/config"
import { getExpRate } from "~/data/pokemonLevelExperienceMap"
import { PokemonLevelingRate } from "~/data/pokemonLevelingRate"
import { createTRPCRouter } from "~/server/api/trpc"
import { importTaxon } from "~/server/inaturalist/importTaxon"
import { getNextEvo } from "~/server/lib/battle/getWildlifeFighter"
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
        wildlife: {
          include: {
            taxon: {
              select: {
                fighterSpeciesName: true,
              },
            },
          },
        },
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
        playerId: null,
        originalPlayerId: null,
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

  tmp: devProcedure.mutation(async ({}) => {
    //
  }),

  fixTaxonProblems: devProcedure.mutation(async ({ ctx }) => {
    const problems = await ctx.prisma.taxon.findMany({
      where: {
        isAnchor: false,
        anchorId: null,
      },
    })

    console.log(`${problems.length} problems`)
    let done = 0
    for await (const problem of problems) {
      let candidateId = problem.ancestorId
      while (true) {
        if (!candidateId) {
          throw new Error(`no ancestorId for taxonId: ${problem.id}`)
        }
        const candidate = await ctx.prisma.taxon.findUniqueOrThrow({
          where: { id: candidateId },
        })
        if (candidate.isAnchor) {
          break
        } else {
          candidateId = candidate.ancestorId
        }
      }
      const anchorId = candidateId
      await ctx.prisma.taxon.update({
        where: {
          id: problem.id,
        },
        data: {
          anchorId,
        },
      })
      console.log(`${++done} of ${problems.length} done`)
    }
    return problems
  }),

  wildlifeToTaxons: devProcedure.mutation(async ({ ctx }) => {
    let wildlife = await ctx.prisma.wildlife.findMany({
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

    const allTaxons = await ctx.prisma.taxon.findMany({
      select: {
        id: true,
      },
    })
    const importedIds = allTaxons.map((t) => t.id)

    wildlife = wildlife.filter((w) => !includes(importedIds, w.taxonId))

    console.log(`Importing ${wildlife.length}`)

    let done = 0
    const chunkSize = 20
    const chunks = chunk(wildlife, chunkSize)
    for (const chunk of chunks) {
      const doChunk = async () => {
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
      // Retry Logic:
      let retries = 0
      while (true) {
        try {
          await doChunk()
          break
        } catch (e: any) {
          console.error(e?.message || e)
          retries++
          const timeout = Math.min(1000 * 2 ** retries, 1000 * 60 * 5)
          console.log(`CHUNK: Retry (${retries}) in ${timeout / 1000}s ...`)
          await new Promise((resolve) => setTimeout(resolve, timeout))
        }
      }
    }

    return { length: wildlife.length }
  }),

  getFighters: devProcedure.mutation(async ({ ctx }) => {
    const taxons = await ctx.prisma.taxon.findMany({
      where: {
        isAnchor: true,
      },
    })

    const allSpecies = taxons.flatMap((t) => {
      const anchored = Dex.species.get(t.fighterSpeciesName)
      if (!anchored) {
        throw new Error(
          `Species not found ${t.fighterSpeciesName} for taxon ${t.id}`
        )
      }
      let lowestEvo = anchored
      while (lowestEvo.prevo) {
        lowestEvo = Dex.species.get(lowestEvo.prevo)
      }

      let allEvos = []
      let highestEvo: Species | undefined = lowestEvo
      while (highestEvo) {
        allEvos.push(highestEvo)
        highestEvo = getNextEvo({
          species: highestEvo,
        })
      }

      return allEvos.map((s) => ({
        name: s.name,
        num: s.num,
        taxonId: t.id,
      }))
    })

    let species = allSpecies
    species = orderBy(species, (s) => s.num)
    species = uniqBy(species, (s) => s.num)
    return {
      allFighters: species.map((s) => s.name).join(", "),
    }
  }),
})

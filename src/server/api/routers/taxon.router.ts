import { Dex, Species } from "@pkmn/dex"
import { TRPCError } from "@trpc/server"
import { first } from "lodash-es"
import { z } from "zod"
import { NO_OF_ALL_TAXONS, WEIRD_ROOT_TAXON_ID } from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { importTaxon } from "~/server/inaturalist/importTaxon"
import { devProcedure } from "../middleware/devProcedure"
import { playerProcedure } from "../middleware/playerProcedure"

export const taxonRouter = createTRPCRouter({
  dev: devProcedure.mutation(async ({}) => {
    const taxonId = 47336
    const url = `https://api.inaturalist.org/v1/taxa/${taxonId}`
    const response = await fetch(url)
    const data = await response.json()

    const schema = z.object({
      results: z.array(
        z.object({
          id: z.number(),
          ancestor_ids: z.array(z.number()),
          observations_count: z.number(),
          children: z.array(
            z.object({
              id: z.number(),
              // ancestor_ids: z.array(z.number()),
              name: z.string(),
              // iconic_taxon_name: z.string().nullable(),
              preferred_common_name: z.string().nullish(),
              observations_count: z.number(),
            })
          ),
        })
      ),
    })

    const parsed = schema.parse(data)
    const result = first(parsed.results)?.children
    return result
  }),

  globalExplorationProgress: playerProcedure.query(async ({ ctx }) => {
    const taxonCount = await ctx.prisma.taxon.count({})
    const taxonCountMax = NO_OF_ALL_TAXONS

    const wildlifeCount = await ctx.prisma.wildlife.count({})
    const animals = await ctx.prisma.taxon.findFirstOrThrow({
      where: { id: 1 },
      select: {
        metadata: true,
      },
    })
    const wildlifeCountMax = animals.metadata.taxonObservationsCount

    return {
      taxonCount,
      taxonCountMax,
      wildlifeCount,
      wildlifeCountMax,
    }
  }),

  getTree: playerProcedure
    .input(z.object({ taxonId: z.number() }))
    .query(async ({ ctx, input }) => {
      const taxon = await ctx.prisma.taxon.findUniqueOrThrow({
        where: { id: input.taxonId },
        include: {
          descendants: {
            include: {
              foundBy: true,
              _count: {
                select: {
                  wildlife: true,
                },
              },
            },
          },
          foundBy: true,
          _count: {
            select: {
              wildlife: true,
            },
          },
        },
      })

      let ancestorIds = taxon.metadata.taxonAncestorIds
      ancestorIds = ancestorIds.filter((id) => id !== WEIRD_ROOT_TAXON_ID)

      let ancestors = await ctx.prisma.taxon.findMany({
        where: {
          id: {
            in: ancestorIds,
          },
        },
        include: {
          foundBy: true,
          _count: {
            select: {
              wildlife: true,
            },
          },
        },
      })

      ancestors = ancestorIds.map(
        (id) => ancestors.find((ancestor) => ancestor.id === id)!
      )

      return {
        taxon,
        ancestors,
      }
    }),

  setFighterSpecies: devProcedure
    .input(z.object({ taxonId: z.number(), fighterSpecies: z.string() }))
    .mutation(async ({ ctx, input }) => {
      let species: Species | undefined = Dex.species.get(input.fighterSpecies)
      if (!species?.num) {
        species = Dex.species
          .all()
          .find((s) => s.num === parseInt(input.fighterSpecies))
      }
      if (!species?.num) {
        throw new Error(`Species ${input.fighterSpecies} not found`)
      }
      const fighterSpeciesName = species.name
      const fighterSpeciesNum = species.num
      const currentTaxon = await ctx.prisma.taxon.findUniqueOrThrow({
        where: { id: input.taxonId },
      })
      const anchored = await ctx.prisma.taxon.findMany({
        where: {
          anchorId: currentTaxon.anchorId ?? currentTaxon.id,
        },
      })
      // console.log(anchored)
      const descendants = anchored.filter((t) =>
        t.metadata.taxonAncestorIds.includes(currentTaxon.id)
      )
      // console.log(descendants)
      await ctx.prisma.taxon.update({
        where: {
          id: currentTaxon.id,
        },
        data: {
          fighterSpeciesName,
          fighterSpeciesNum,
          isAnchor: true,
          anchorId: null,
        },
      })
      await ctx.prisma.taxon.updateMany({
        where: {
          id: {
            in: descendants.map((t) => t.id),
          },
        },
        data: {
          fighterSpeciesName,
          fighterSpeciesNum,
          isAnchor: false,
          anchorId: currentTaxon.id,
        },
      })
    }),

  unsetFighterSpecies: devProcedure
    .input(z.object({ taxonId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const currentTaxon = await ctx.prisma.taxon.findUniqueOrThrow({
        where: { id: input.taxonId },
      })
      if (!currentTaxon.ancestorId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No ancestor found",
        })
      }
      if (!currentTaxon.isAnchor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Taxon is not an anchor",
        })
      }

      const ancestor = await ctx.prisma.taxon.findFirst({
        where: {
          id: currentTaxon.ancestorId,
        },
      })

      if (!ancestor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No ancestor found",
        })
      }
      const anchorId = ancestor.anchorId
      const fighterSpeciesName = ancestor.fighterSpeciesName
      const fighterSpeciesNum = ancestor.fighterSpeciesNum

      await ctx.prisma.taxon.updateMany({
        where: {
          OR: [{ anchorId: currentTaxon.id }, { id: currentTaxon.id }],
        },
        data: {
          fighterSpeciesName,
          fighterSpeciesNum,
          isAnchor: false,
          anchorId,
        },
      })
    }),

  importTaxon: devProcedure
    .input(z.object({ taxonId: z.number(), playerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await importTaxon({
        prisma: ctx.prisma,
        taxonId: input.taxonId,
        playerId: input.playerId,
      })
    }),
})

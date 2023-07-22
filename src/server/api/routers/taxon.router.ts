import { first } from "lodash-es"
import { z } from "zod"
import { NO_OF_ALL_TAXONS } from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
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

  getTree: playerProcedure
    .input(z.object({ taxonId: z.number() }))
    .query(async ({ ctx, input }) => {
      const taxonCount = await ctx.prisma.taxon.count({})
      const taxonCountMax = NO_OF_ALL_TAXONS

      const taxon = await ctx.prisma.taxon.findUniqueOrThrow({
        where: { id: input.taxonId },
        include: {
          descendants: {
            include: {
              _count: {
                select: {
                  wildlife: true,
                },
              },
            },
          },
          _count: {
            select: {
              wildlife: true,
            },
          },
        },
      })

      let ancestorIds = taxon.metadata.taxonAncestorIds
      ancestorIds = ancestorIds.filter((id) => id !== 48460)

      let ancestors = await ctx.prisma.taxon.findMany({
        where: {
          id: {
            in: ancestorIds,
          },
        },
        include: {
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
        taxonCount,
        taxonCountMax,
        taxon,
        ancestors,
      }
    }),
})

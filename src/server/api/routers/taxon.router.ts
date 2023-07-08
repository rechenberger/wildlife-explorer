import { first } from "lodash-es"
import { z } from "zod"
import { createTRPCRouter } from "~/server/api/trpc"
import { devProcedure } from "../middleware/devProcedure"

export const taxonRouter = createTRPCRouter({
  dev: devProcedure.mutation(async ({ ctx }) => {
    const taxonId = 1
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
              preferred_common_name: z.string().nullable(),
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
})

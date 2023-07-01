import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { Observation } from "~/server/inaturalist/schema"

export const wildlifeRouter = createTRPCRouter({
  find: publicProcedure
    .input(z.object({ lat: z.number(), lng: z.number() }))
    .query(async ({ input }) => {
      const { lat, lng } = input
      const response = await fetch(
        `https://api.inaturalist.org/v1/observations?taxon_id=1&lat=${lat}&lng=${lng}&radius=10&order=desc&order_by=created_at`
      )
      const data = await response.json()
      const schema = z.object({
        total_results: z.number(),
        page: z.number(),
        per_page: z.number(),
        results: z.array(Observation),
      })
      // console.log(data)
      const parsed = schema.parse(data)
      // console.log(parsed)
      console.log(parsed.results[0])
      return parsed
    }),
})

import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { Observation } from "~/server/inaturalist/schema"

export const wildlifeRouter = createTRPCRouter({
  find: publicProcedure
    .input(
      z.object({ lat: z.number(), lng: z.number(), radiusInKm: z.number() })
    )
    .query(async ({ input }) => {
      const { lat, lng, radiusInKm } = input
      const url = `https://api.inaturalist.org/v1/observations?taxon_id=1&lat=${lat}&lng=${lng}&radius=${radiusInKm}&order=desc&order_by=created_at&per_page=200&locale=de`
      console.log(url)
      const response = await fetch(url)
      try {
        const data = await response.json()
        const schema = z.object({
          total_results: z.number(),
          page: z.number(),
          per_page: z.number(),
          results: z.array(Observation),
        })
        const parsed = schema.parse(data)
        console.log(parsed.total_results, parsed.results.length)
        return parsed
      } catch (error) {
        const text = await response.text()
        console.log(text)
        throw new TRPCError({
          code: "PARSE_ERROR",
          message: text,
        })
      }
    }),
})

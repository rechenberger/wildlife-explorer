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
      const data = await response.json()
      const schema = z.object({
        total_results: z.number(),
        page: z.number(),
        per_page: z.number(),
        results: z.array(Observation),
      })
      const parsed = schema.parse(data)
      console.log(parsed.total_results, parsed.results.length)

      const wildlifes = parsed.results.map((o) => {
        return {
          id: o.id,
          name: o.taxon.preferred_common_name || o.taxon.name,
          lat: o.geojson.coordinates[1],
          lng: o.geojson.coordinates[0],
          imgUrl: o.taxon.default_photo?.square_url,
          observationUrl: o.uri,
          wikiUrl: o.taxon.wikipedia_url,
        }
      })

      return wildlifes
    }),
})

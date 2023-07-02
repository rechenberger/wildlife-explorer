import { z } from "zod"
import { RADIUS_IN_KM_SEE_WILDLIFE } from "~/config"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { Observation } from "~/server/inaturalist/schema"
import { playerProcedure } from "../middleware/playerProcedure"

export const wildlifeRouter = createTRPCRouter({
  find: publicProcedure
    .input(
      z.object({ lat: z.number(), lng: z.number(), radiusInKm: z.number() })
    )
    .query(async ({ input }) => {
      return findWildlife(input)
    }),

  nearMe: playerProcedure.query(async ({ ctx }) => {
    return findWildlife({
      lat: ctx.player.lat,
      lng: ctx.player.lng,
      radiusInKm: RADIUS_IN_KM_SEE_WILDLIFE,
    })
  }),
})

const findWildlife = async ({
  lat,
  lng,
  radiusInKm,
}: {
  lat: number
  lng: number
  radiusInKm: number
}) => {
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
}

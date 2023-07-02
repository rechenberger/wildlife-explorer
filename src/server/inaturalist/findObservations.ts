import { z } from "zod"
import { Observation } from "./schema"

export const findObservations = async ({
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

  const wildlifes = parsed.results.flatMap((o) => {
    const lat = o.geojson.coordinates[1]
    const lng = o.geojson.coordinates[0]
    if (!lat || !lng) return []
    return [
      {
        id: o.id,
        name: o.taxon.preferred_common_name || o.taxon.name,
        lat,
        lng,
        taxonImageUrlSquare: o.taxon.default_photo?.square_url,
        taxonImageUrlMedium: o.taxon.default_photo?.medium_url,
        taxonImageUrlSmall: o.taxon.default_photo?.url,
        observationUrl: o.uri,
        wikiUrl: o.taxon.wikipedia_url,
        // imagesObservation: map(o.photos, (p) => p.url),
      },
    ]
  })

  return wildlifes
}

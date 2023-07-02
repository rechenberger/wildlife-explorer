import { z } from "zod"
import { type WildlifeMetadata } from "../schema/WildlifeMetadata"
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
        // ids:
        observationId: o.id,
        taxonId: o.taxon.id,

        // UI:
        name: o.taxon.preferred_common_name || o.taxon.name,
        lat,
        lng,
        taxonImageUrlSquare: o.taxon.default_photo?.square_url ?? null,
        taxonImageUrlMedium: o.taxon.default_photo?.medium_url ?? null,
        taxonImageUrlSmall: o.taxon.default_photo?.url ?? null,
        observationUrl: o.uri,
        taxonWikiUrl: o.taxon.wikipedia_url,

        // taxon:
        taxonAncestorIds: o.taxon.ancestor_ids,
        taxonSearchRank: o.taxon.universal_search_rank,
        taxonRank: o.taxon.rank,
        taxonObservationsCount: o.taxon.observations_count,
        taxonName: o.taxon.name,
        taxonCommonName: o.taxon.preferred_common_name ?? null,

        // observation:
        observationPositionalAccuracy: o.positional_accuracy,
        observationAt: o.observed_on,
        observationCaptive: o.captive,
        observationUserId: o.user.id,

        // imagesObservation: map(o.photos, (p) => p.url),
      } satisfies WildlifeMetadata,
    ]
  })

  return wildlifes
}

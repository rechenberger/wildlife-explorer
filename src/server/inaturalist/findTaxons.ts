import { z } from "zod"
import { type TaxonMetadata } from "../schema/TaxonMetadata"
import { Taxon } from "./schema"

export const findTaxons = async ({ taxonIds }: { taxonIds: number[] }) => {
  const locale = "de"
  const url = `https://api.inaturalist.org/v1/taxa/${taxonIds.join(
    ","
  )}?locale=${locale}`
  const response = await fetch(url)
  const data = await response.json()
  const schema = z.object({
    total_results: z.number(),
    page: z.number(),
    per_page: z.number(),
    results: z.array(Taxon),
  })
  const parsed = schema.parse(data)

  return parsed.results.map((taxon) => {
    const metadata = {
      taxonId: taxon.id,
      taxonImageUrlSquare: taxon.default_photo?.square_url ?? null,
      taxonImageUrlMedium: taxon.default_photo?.medium_url ?? null,
      taxonImageUrlSmall: taxon.default_photo?.url ?? null,
      taxonImageLicenseCode: taxon.default_photo?.license_code ?? null,
      taxonImageAttribution: taxon.default_photo?.attribution ?? null,
      taxonWikiUrl: taxon.wikipedia_url,

      // taxon:
      taxonAncestorIds: taxon.ancestor_ids,
      taxonSearchRank: taxon.universal_search_rank,
      taxonRank: taxon.rank,
      taxonObservationsCount: taxon.observations_count,
      taxonName: taxon.name,
      taxonCommonName: taxon.english_common_name ?? null,
      taxonLocaleNames: {
        en: taxon.english_common_name ?? null,
        de: taxon.preferred_common_name ?? null,
      },
    } satisfies TaxonMetadata

    return metadata
  })
}

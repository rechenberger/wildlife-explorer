import { z } from "zod"
import { Taxon } from "./schema"

export const findTaxon = async ({ taxonId }: { taxonId: number }) => {
  const locale = "de"
  const url = `https://api.inaturalist.org/v1/taxa/${taxonId}?locale=${locale}`
  // console.log(url)
  const response = await fetch(url)
  const data = await response.json()
  const schema = z.object({
    total_results: z.number(),
    page: z.number(),
    per_page: z.number(),
    results: z.array(Taxon),
  })
  const parsed = schema.parse(data)
  return parsed
}

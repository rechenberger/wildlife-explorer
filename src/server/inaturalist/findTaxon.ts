import { findTaxons } from "./findTaxons"

export const findTaxon = async ({ taxonId }: { taxonId: number }) => {
  const taxons = await findTaxons({ taxonIds: [taxonId] })
  const taxon = taxons.find((t) => t.taxonId === taxonId)
  if (!taxon) throw new Error(`taxon not found: ${taxonId}`)
  return taxon
}

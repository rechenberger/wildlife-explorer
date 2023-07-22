import { type TaxonMetadata } from "../schema/TaxonMetadata"
import { findTaxons } from "./findTaxons"

const BATCH_WINDOW_IN_MS = 2000
const BATCH_MAX_SIZE = 30

let taxonIdsBatch: number[] = []
let timer: NodeJS.Timeout | null = null
let taxonPromises: { [key: number]: (value: any) => void } = {}

const processBatch = async () => {
  try {
    const taxons = await findTaxons({ taxonIds: taxonIdsBatch })
    taxonIdsBatch.forEach((id) => {
      const taxon = taxons.find((t) => t.taxonId === id)
      if (!taxon) throw new Error(`taxon not found: ${id}`)
      taxonPromises[id]!(taxon)
    })
  } catch (error) {
    Object.values(taxonPromises).forEach((reject) => reject(error))
  } finally {
    taxonIdsBatch = []
    taxonPromises = {}
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }
}

export const findTaxon = ({ taxonId }: { taxonId: number }) => {
  return new Promise<TaxonMetadata>((resolve) => {
    taxonIdsBatch.push(taxonId)
    taxonPromises[taxonId] = resolve

    if (taxonIdsBatch.length >= BATCH_MAX_SIZE) {
      processBatch()
    } else if (!timer) {
      timer = setTimeout(processBatch, BATCH_WINDOW_IN_MS)
    }
  })
}

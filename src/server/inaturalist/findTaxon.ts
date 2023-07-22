import { findTaxons } from "./findTaxons"

let taxonIdsBatch: number[] = []
let timer: NodeJS.Timeout | null = null
let taxonPromises: { [key: number]: (value: any) => void } = {}

export const findTaxon = ({ taxonId }: { taxonId: number }) => {
  return new Promise((resolve, reject) => {
    taxonIdsBatch.push(taxonId)
    taxonPromises[taxonId] = resolve

    if (!timer) {
      timer = setTimeout(async () => {
        try {
          const taxons = await findTaxons({ taxonIds: taxonIdsBatch })
          taxonIdsBatch.forEach((id) => {
            const taxon = taxons.find((t) => t.taxonId === id)
            if (!taxon) throw new Error(`taxon not found: ${id}`)
            taxonPromises[id]!(taxon)
          })
        } catch (error) {
          reject(error)
        } finally {
          taxonIdsBatch = []
          taxonPromises = {}
          timer = null
        }
      }, 2000)
    }
  })
}

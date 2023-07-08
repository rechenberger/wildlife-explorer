import { flatMap } from "lodash-es"
import { taxonMappingByAI } from "./taxonMappingByAI"

const allMappings = flatMap(taxonMappingByAI, (t) => t.children)
export const taxonMappingByAncestors = (ancestorIds: number[]) => {
  for (const ancestorId of ancestorIds) {
    const mapping = allMappings.find(
      (mapping) => mapping.taxonId === ancestorId
    )
    if (mapping) return mapping
  }
  return { taxonId: 0, name: "Unknown", pokemon: "Togepi", count: 0 }
}

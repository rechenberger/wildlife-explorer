import { Dex } from "@pkmn/dex"
import { flatMap, reverse } from "lodash-es"
import { taxonMappingByAI } from "./taxonMappingByAI"

const allMappings = flatMap(taxonMappingByAI, (t) => t.children)
export const taxonMappingByAncestors = (ancestorIds: number[]) => {
  for (const ancestorId of reverse([...ancestorIds])) {
    const mapping = allMappings.find(
      (mapping) => mapping.taxonId === ancestorId
    )

    // Check if pokemon is found in dex
    const checkDex = !!Dex.species.get(mapping?.pokemon ?? "")?.num
    if (!checkDex) continue

    if (mapping) return mapping
  }
  console.warn(`No mapping found for ${ancestorIds}`)
  return { taxonId: 0, name: "Unknown", pokemon: "Togepi", count: 0 }
}

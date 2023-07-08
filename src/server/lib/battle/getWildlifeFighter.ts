import { Dex } from "@pkmn/dex"
import { type Wildlife } from "@prisma/client"
import { type WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
import { charizard, pikachu } from "./predefinedTeam"
import { taxonMappingByAncestors } from "./taxonMappingByAncestors"

const MAX_NAME_LENGTH = 20

export const getWildlifeFighter = async ({
  wildlife,
  isCaught,
  seed,
  locale,
}: {
  wildlife: Wildlife & { metadata: WildlifeMetadata }
  isCaught: boolean
  seed: string
  locale: "de" | "en"
}) => {
  const base = isCaught ? pikachu : charizard
  const mapping = taxonMappingByAncestors(wildlife.metadata.taxonAncestorIds)
  const speciesName = mapping.pokemon
  const species = Dex.species.get(speciesName)
  const learnSet = await Dex.learnsets.get(speciesName)
  console.log("species", species, learnSet)
  return {
    ...base,
    // name:
    //   wildlife.metadata.taxonLocaleNames?.[locale] ||
    //   wildlife.metadata.taxonCommonName ||
    //   wildlife.metadata.taxonName,
    name: wildlife.id.substring(0, MAX_NAME_LENGTH),
    species: speciesName,
  }
}

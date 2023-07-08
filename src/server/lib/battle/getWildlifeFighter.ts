import { Dex, type Learnset } from "@pkmn/dex"
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
  const learnset = await Dex.learnsets.get(speciesName)
  const level = 2
  const moves = getPokemonMoves(learnset, level, Math.max(species.gen, 3))
  // console.log("species", species, learnset, moves)
  console.log("species", {
    speciesName,
    gen: species.gen,
    // learnset: learnset.learnset,
    moves,
  })
  // console.log("species", speciesName, species)
  return {
    ...base,
    // name:
    //   wildlife.metadata.taxonLocaleNames?.[locale] ||
    //   wildlife.metadata.taxonCommonName ||
    //   wildlife.metadata.taxonName,
    name: wildlife.id.substring(0, MAX_NAME_LENGTH),
    species: speciesName,
    moves,
  }
}

function getPokemonMoves(
  learnset: Learnset,
  level: number,
  generation: number
): string[] {
  const moves: string[] = []
  const gen = generation.toString()
  const lvl = "L" + level.toString()

  for (const move in learnset.learnset) {
    const learnMethods = learnset.learnset[move]!

    for (const method of learnMethods) {
      if (method.startsWith(gen) && method[1] === "L") {
        if (method[1] === "L" && parseInt(method.substring(2)) <= level) {
          moves.push(move)
        }
      }
    }
  }

  return moves
}

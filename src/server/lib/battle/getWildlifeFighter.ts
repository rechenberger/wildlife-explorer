import { Dex, Species } from "@pkmn/dex"
import { type Wildlife } from "@prisma/client"
import { filter, orderBy, take } from "lodash-es"
import { MAX_MOVES_PER_FIGHTER } from "~/config"
import { type WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
import { rngInt } from "~/utils/seed"
import { charizard, pikachu } from "./predefinedTeam"
import { taxonMappingByAncestors } from "./taxonMappingByAncestors"

const MAX_NAME_LENGTH = 20

export const getWildlifeFighter = async ({
  wildlife,
  isCaught,
  seed,
}: {
  wildlife: Wildlife & { metadata: WildlifeMetadata }
  isCaught: boolean
  seed: string
}) => {
  const base = isCaught ? pikachu : charizard
  const mapping = taxonMappingByAncestors(wildlife.metadata.taxonAncestorIds)
  const speciesName = mapping.pokemon
  const species = Dex.species.get(speciesName)
  const level = rngInt({
    seed: [seed, "level"],
    min: 1,
    max: 20,
  })

  const possibleMoves = await getMovesInLearnset(species)
  const moves = take(
    filter(
      orderBy(possibleMoves, (m) => m.level, "desc"),
      (m) => m.level <= level
    ),
    MAX_MOVES_PER_FIGHTER
  ).map((m) => m.move)

  // console.log("species", {
  //   speciesName,
  //   gen: species.gen,
  //   // learnset: learnset.learnset,
  //   moves,
  // })

  return {
    ...base,
    name: wildlife.id.substring(0, MAX_NAME_LENGTH),
    species: speciesName,
    moves,
    level,
  }
}

async function getMovesInLearnset(species: Species) {
  const moves: {
    move: string
    level: number
    method: "level"
  }[] = []
  const learnset = await Dex.learnsets.get(species.name)
  const gen = Math.max(species.gen, 3).toString()

  for (const move in learnset.learnset) {
    const learnMethods = learnset.learnset[move]!

    for (const method of learnMethods) {
      if (method.startsWith(gen) && method[1] === "L") {
        const isLevelThingy = method[1] === "L"
        const level = parseInt(method.substring(2))
        if (isLevelThingy) {
          moves.push({
            move,
            level,
            method: "level",
          })
        }
      }
    }
  }
  return moves
}

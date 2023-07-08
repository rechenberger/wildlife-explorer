import { Dex, Species } from "@pkmn/dex"
import { type Wildlife } from "@prisma/client"
import { filter, orderBy, take } from "lodash-es"
import { MAX_MOVES_PER_FIGHTER } from "~/config"
import { type WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
import { rngInt, rngItem } from "~/utils/seed"
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

  const nature = rngItem({
    items: Dex.natures.all(),
    seed: [seed, "nature"],
  })

  const gender = rngItem({
    items: ["M", "F"],
    seed: [seed, "gender"],
  })

  return {
    ...base,
    name: wildlife.id.substring(0, MAX_NAME_LENGTH),
    species: speciesName,
    moves,
    level,
    nature: nature.name,
    ivs: {
      hp: rngInt({
        seed: [seed, "iv", "hp"],
        min: 0,
        max: 31,
      }),
      atk: rngInt({
        seed: [seed, "iv", "atk"],
        min: 0,
        max: 31,
      }),
      def: rngInt({
        seed: [seed, "iv", "def"],
        min: 0,
        max: 31,
      }),
      spa: rngInt({
        seed: [seed, "iv", "spa"],
        min: 0,
        max: 31,
      }),
      spd: rngInt({
        seed: [seed, "iv", "spd"],
        min: 0,
        max: 31,
      }),
      spe: rngInt({
        seed: [seed, "iv", "spe"],
        min: 0,
        max: 31,
      }),
    },
    evs: {
      hp: 0,
      atk: 0,
      def: 0,
      spa: 0,
      spd: 0,
      spe: 0,
    },
    gender,
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

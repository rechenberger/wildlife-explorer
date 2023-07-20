import { Dex, type PokemonSet, type Species } from "@pkmn/dex"
import { filter, find, map, max, min, orderBy, take } from "lodash-es"
import { MAX_MOVES_PER_FIGHTER, USE_LATEST_GEN } from "~/config"
import { type CatchMetadata } from "~/server/schema/CatchMetadata"
import { type WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
import { rngInt, rngItem, rngItemWithWeights } from "~/utils/seed"
import { taxonMappingByAncestors } from "./taxonMappingByAncestors"

export type GetWildlifeFighterOptions = {
  wildlife: {
    metadata: Pick<
      WildlifeMetadata,
      | "taxonAncestorIds"
      | "taxonCommonName"
      | "taxonName"
      | "observationCaptive"
    >
  }
  metadata?: Pick<CatchMetadata, "level" | "moves" | "evs" | "speciesName">
  seed: string
  idx?: number
  name?: string | null
}

export const getHightestPossibleEvoByLevel = ({
  species,
  level,
}: {
  species: Species
  level: number
}) => {
  let highestPossibleEvo = null
  while (true) {
    const possibleEvo = getNextPossibleEvoByLevel({
      species,
      level,
    })
    if (!possibleEvo) break
    species = possibleEvo
    highestPossibleEvo = possibleEvo
  }
  return highestPossibleEvo
}

export const getNextPossibleEvoByLevel = ({
  species,
  level,
}: {
  species: Species
  level: number
}) => {
  const evos = map(species.evos, (e) => Dex.species.get(e))
  const possibleEvo = find(evos, (e) => {
    // if (e.evoType) return false
    // if (e.evoCondition) return false
    // if (e.evoItem) return false
    // if (e.evoMove) return false

    if (!e.evoLevel) return false
    if (e.evoLevel > level) return false
    return true
  })
  return possibleEvo
}

export const getWildlifeFighter = async ({
  wildlife,
  seed,
  idx,
  metadata: catchMetaData,
  name: givenName,
}: GetWildlifeFighterOptions) => {
  const minLevel = wildlife.metadata.observationCaptive ? 20 : 1
  const maxLevel = wildlife.metadata.observationCaptive ? 100 : 20
  const level =
    catchMetaData?.level ||
    rngInt({
      seed: [seed, "level"],
      min: minLevel,
      max: maxLevel,
    })

  const mapping = taxonMappingByAncestors(wildlife.metadata.taxonAncestorIds)
  let speciesName = catchMetaData?.speciesName ?? mapping.pokemon
  let species = Dex.species.get(speciesName)

  // Wildlife starts at lowest evolution
  if (!!catchMetaData?.speciesName) {
    while (species.prevo) {
      species = Dex.species.get(species.prevo)
      speciesName = species.name
    }
  }

  // Evolve captives to highest possible evolution
  const canEvolveByLevel = wildlife.metadata.observationCaptive
  if (canEvolveByLevel) {
    const highestPossibleEvo = getHightestPossibleEvoByLevel({ species, level })
    if (highestPossibleEvo) {
      species = highestPossibleEvo
      speciesName = species.name
    }
  }

  let moves: string[]
  if (catchMetaData?.moves?.length) {
    // PP are done in applyFighterStats
    moves = catchMetaData?.moves?.map((m) => m.id)
  } else {
    const possibleMoves = await getMovesInLearnset(speciesName)
    moves = take(
      filter(
        orderBy(possibleMoves, (m) => m.level, "desc"),
        (m) => m.level <= level
      ),
      MAX_MOVES_PER_FIGHTER
    ).map((m) => m.move)
  }

  const nature = rngItem({
    items: Dex.natures.all(),
    seed: [seed, "nature"],
  })

  const gender = rngItem({
    items: ["M", "F"],
    seed: [seed, "gender"],
  })

  const ability = rngItemWithWeights({
    seed: [seed, "ability"],
    items: map(species.abilities, (a, key) => ({
      item: a as string,
      weight: key === "H" ? 0.1 : 1,
    })),
  })

  // TODO: ???
  const item = ""

  // TODO: locale
  const name = `${typeof idx === "number" ? `#${idx + 1}: ` : ""}${
    givenName ??
    wildlife.metadata.taxonCommonName ??
    wildlife.metadata.taxonName
  }`

  const ivs = {
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
  }

  const evs = catchMetaData?.evs ?? {
    hp: 0,
    atk: 0,
    def: 0,
    spa: 0,
    spd: 0,
    spe: 0,
  }

  // console.log({ name, ivsSum: Object.values(ivs).reduce((a, b) => a + b) })

  const fighter: PokemonSet = {
    // ...base,
    name,
    species: speciesName,
    moves,
    level,
    nature: nature.name,
    ivs,
    evs,
    gender,
    item,
    ability,
  }

  return fighter
}

export async function getMovesInLearnset(speciesName: string) {
  const species = Dex.species.get(speciesName)
  const moves: {
    move: string
    level: number
    method: "level"
    gen: number
  }[] = []
  const learnset = await Dex.learnsets.get(species.name)

  // console.log(species)
  // console.log(learnset)
  // const gen = Math.max(species.gen, 3).toString()

  for (const move in learnset.learnset) {
    const learnMethods = learnset.learnset[move]!

    for (const method of learnMethods) {
      const isLevelThingy = method[1] === "L"
      if (isLevelThingy) {
        const gen = parseInt(method[0]!)
        const level = parseInt(method.substring(2))
        if (isLevelThingy) {
          moves.push({
            move,
            level,
            method: "level",
            gen,
          })
        }
      }
    }
  }

  const possibleGens = map(moves, (m) => m.gen)
  const latestGen = USE_LATEST_GEN ? max(possibleGens) : min(possibleGens)

  const latestMoves = filter(moves, (m) => !!latestGen && m.gen === latestGen)

  return latestMoves
}

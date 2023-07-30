import { Dex, type PokemonSet } from "@pkmn/dex"
import { filter, find, map, max, min, uniq } from "lodash-es"
import {
  FIGHTER_MAX_NUM,
  MAX_MOVES_PER_FIGHTER,
  USE_LATEST_GEN,
} from "~/config"
import { PokemonLevelingRate } from "~/data/pokemonLevelingRate"
import { rngInt, rngItem, rngItemWithWeights, rngItems } from "~/utils/seed"

export type GetDungeonFighterOptions = {
  seed: string
  level: number
  idx: number
}

export const getDungeonFighter = async ({
  seed,
  level,
  idx,
}: GetDungeonFighterOptions): Promise<PokemonSet> => {
  const allSpecies = Dex.species.all()

  const num = rngInt({ seed: [seed, "species"], min: 1, max: FIGHTER_MAX_NUM })

  const retry = (reason: string) => {
    const newSeed = `${seed}-retry`
    console.log(
      `Species #${num} because: ${reason}`,
      `trying with seed ${newSeed}`
    )
    return getDungeonFighter({ seed: newSeed, level, idx })
  }

  const species = find(allSpecies, (s) => s.num === num)
  if (!species) {
    return retry("not found in dex")
  }
  const levelingRate = PokemonLevelingRate[`${num}`]
  if (!levelingRate) {
    return retry("levelingRate not found")
  }

  let speciesName = species.name

  let moves: string[] = []
  const possibleMoves = await getAllMovesInLearnset(speciesName)
  if (!possibleMoves.length) {
    return retry("no moves in learnset")
  }

  const possibleStatusMoves = filter(
    possibleMoves,
    (m) => Dex.moves.get(m.move).category === "Status"
  )
  const possibleNonStatusMoves = filter(
    possibleMoves,
    (m) => Dex.moves.get(m.move).category !== "Status"
  )

  const amountStatusMoves = rngInt({
    seed: [seed, "moves", "status", "amount"],
    min: 0,
    max: 2,
  })

  const amountNonStatusMoves = MAX_MOVES_PER_FIGHTER - amountStatusMoves

  moves.push(
    ...rngItems({
      items: possibleStatusMoves.map((m) => m.move),
      seed: [seed, "moves", "status"],
      count: amountStatusMoves,
    })
  )

  moves.push(
    ...rngItems({
      items: possibleNonStatusMoves.map((m) => m.move),
      seed: [seed, "moves", "nonStatus"],
      count: amountNonStatusMoves,
    })
  )

  moves = uniq(moves).filter(Boolean)

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
    species.name
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

  //could be more random, but max 252 per stat and max 510 total *shrug*
  const evs = {
    hp: level - 20,
    atk: level - 20,
    def: level - 20,
    spa: level - 20,
    spd: level - 20,
    spe: level - 20,
  }

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

export async function getAllMovesInLearnset(speciesName: string) {
  const species = Dex.species.get(speciesName)
  const moves: {
    move: string
    gen: number
  }[] = []
  const learnset = await Dex.learnsets.get(species.name)

  for (const move in learnset.learnset) {
    const learnMethods = learnset.learnset[move]!

    for (const method of learnMethods) {
      const gen = parseInt(method[0]!)
      moves.push({
        move,
        gen,
      })
    }
  }

  const possibleGens = map(moves, (m) => m.gen)
  const latestGen = USE_LATEST_GEN ? max(possibleGens) : min(possibleGens)

  const latestMoves = filter(moves, (m) => !!latestGen && m.gen === latestGen)

  return latestMoves
}

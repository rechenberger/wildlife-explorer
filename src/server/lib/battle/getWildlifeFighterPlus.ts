import { Dex, type PokemonSet } from "@pkmn/dex"
import { Battle, toID, type Pokemon } from "@pkmn/sim"
import { first } from "lodash-es"
import { z } from "zod"
import {
  WildlifeFighterPlusMove,
  getWildlifeFighterPlusMove,
} from "./WildlifeFighterPlusMove"
import {
  getWildlifeFighter,
  type GetWildlifeFighterOptions,
} from "./getWildlifeFighter"

export const getWildlifeFighterPlus = async (
  options: GetWildlifeFighterOptions
) => {
  const fighter = await getWildlifeFighter(options)

  const battle = new Battle({
    formatid: toID("gen7randombattle"),
    seed: [13103, 5088, 17178, 48392], // TODO:
  })
  battle.setPlayer("p1", {
    name: "Player",
    team: [fighter],
  })

  const p = first(first(battle.sides)?.pokemon)
  if (!p) {
    throw new Error("Could not build FighterPlus")
  }

  return transformWildlifeFighterPlus({
    pokemonSet: fighter,
    pokemon: p,
  })
}

export const transformWildlifeFighterPlus = ({
  pokemonSet,
  pokemon,
  foeTypes,
}: {
  pokemonSet: PokemonSet
  pokemon: Pokemon
  foeTypes?: string[]
}) => {
  const p = pokemon

  const moves = p.moves.map((move) => {
    return getWildlifeFighterPlusMove({
      move,
      p,
      foeTypes,
    })
  })

  let stats = {
    hp: p.maxhp,
    atk: 0,
    def: 0,
    spa: 0,
    spd: 0,
    spe: 0,
  }
  try {
    stats = {
      hp: p.maxhp,
      atk: p.getStat("atk", true, true),
      def: p.getStat("def", true, true),
      spa: p.getStat("spa", true, true),
      spd: p.getStat("spd", true, true),
      spe: p.getStat("spe", true, true),
    }
  } catch (error) {
    // Happens on Moorschneehuhn (Torchic 18 M) with ability blaze
    console.error(
      "ERROR Getting stats:",
      {
        name: p.name,
        speciesName: p.species.name,
        ability: p.ability,
        level: p.level,
        sideName: p.side.name,
      },
      (error as any)?.message || error,
      error
    )
  }

  const moveRequestData = p.getMoveRequestData()

  const fighterPlus = {
    hp: p.hp,
    hpMax: p.maxhp,
    types: p.types,
    status: p.status,
    moves,
    ability: Dex.abilities.get(p.ability),
    species: p.species.name,
    speciesNum: p.species.num,
    level: p.level,
    gender: p.gender,
    nature: pokemonSet.nature,
    stats,
    isActive: p.isActive,
    justFainted: p.side.faintedThisTurn === p,
    lastMove: p.lastMove,
    trappedInMoves: moveRequestData?.trapped
      ? moveRequestData.moves
      : undefined,
    // statusState: p.statusState,
  } satisfies WildlifeFighterPlus

  return WildlifeFighterPlus.parse(fighterPlus)
}

export const WildlifeFighterPlus = z.object({
  hp: z.number(),
  hpMax: z.number(),
  types: z.array(z.string()),
  status: z.string(),
  moves: z.array(WildlifeFighterPlusMove),
  ability: z.object({
    name: z.string(),
    desc: z.string(),
  }),
  species: z.string(),
  speciesNum: z.number(),
  level: z.number(),
  gender: z.string(),
  nature: z.string(),
  stats: z.object({
    hp: z.number(),
    atk: z.number(),
    def: z.number(),
    spa: z.number(),
    spd: z.number(),
    spe: z.number(),
  }),
  isActive: z.boolean(),
  justFainted: z.boolean(),
  lastMove: z
    .object({
      name: z.string(),
      totalDamage: z.number().or(z.literal(false)).nullish(),
    })
    .nullish(),
  trappedInMoves: z
    .array(
      z.object({
        id: z.string(),
        move: z.string(),
      })
    )
    .nullish(),
})
export type WildlifeFighterPlus = z.infer<typeof WildlifeFighterPlus>

import { Dex, type PokemonSet } from "@pkmn/dex"
import { Battle, toID, type Pokemon } from "@pkmn/sim"
import { first } from "lodash-es"
import { z } from "zod"
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
    const data = p.getMoveData(move)
    const definition = Dex.moves.getByID(toID(data?.id))
    const moveType = definition.type
    const immunity = foeTypes ? Dex.getImmunity(moveType, foeTypes) : null
    const effectiveness = foeTypes
      ? Dex.getEffectiveness(moveType, foeTypes)
      : null

    return {
      name: data?.move || move,
      status: data,
      definition,
      effectiveness,
      immunity,
    }
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
      atk: p.getStat("atk"),
      def: p.getStat("def"),
      spa: p.getStat("spa"),
      spd: p.getStat("spd"),
      spe: p.getStat("spe"),
    }
  } catch (error) {
    // Happens on Moorschneehuhn (Torchic 18 M) with ability blaze
    console.error(p)
    console.error("ERROR Getting stats:", error)
  }

  const fighterPlus = {
    hp: p.hp,
    hpMax: p.maxhp,
    types: p.types,
    status: p.status,
    moves,
    ability: Dex.abilities.get(p.ability),
    species: p.species.name,
    speciesDefinition: p.species,
    level: p.level,
    gender: p.gender,
    nature: pokemonSet.nature,
    stats,
    isActive: p.isActive,
    justFainted: p.side.faintedThisTurn === p,
    lastMove: p.lastMove,
    // statusState: p.statusState,
  } satisfies WildlifeFighterPlus

  return fighterPlus
}

export const WildlifeFighterPlus = z.object({
  hp: z.number(),
  hpMax: z.number(),
  types: z.array(z.string()),
  status: z.string(),
  moves: z.array(
    z.object({
      name: z.string(),
      status: z.any(),
      definition: z.any(),
      effectiveness: z.any(),
      immunity: z.any(),
    })
  ),
  ability: z.any(),
  species: z.string(),
  speciesDefinition: z.any(),
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
})
export type WildlifeFighterPlus = z.infer<typeof WildlifeFighterPlus>

import { Dex, PokemonSet } from "@pkmn/dex"
import { Battle, Pokemon, toID } from "@pkmn/sim"
import { first } from "lodash-es"
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
  const fighterPlus = {
    hp: p.hp,
    hpMax: p.hp,
    types: p.types,
    status: p.status,
    moves,
    ability: Dex.abilities.get(p.ability),
    species: p.species.name,
    level: p.level,
    gender: p.gender,
    nature: pokemonSet.nature,
  }

  return fighterPlus
}

export type WildlifeFighterPlus = Awaited<
  ReturnType<typeof transformWildlifeFighterPlus>
>

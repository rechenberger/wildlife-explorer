import { Dex, type PokemonSet } from "@pkmn/dex"
import { Battle, toID } from "@pkmn/sim"
import { first, map } from "lodash-es"

export const getWildlifeFighterPlus = async (fighter: PokemonSet) => {
  const battle = new Battle({
    formatid: toID("gen7randombattle"),
    // formatid: toID("doubles"),
    seed: [13103, 5088, 17178, 48392], // TODO:
  })
  // const pokemon = new Pokemon(fighter, battle.sides[0])
  battle.setPlayer("p1", {
    name: "Player",
    team: [fighter],
  })

  const p = first(first(battle.sides)?.pokemon)
  if (!p) {
    throw new Error("Could not build FighterPlus")
  }

  const fighterPlus = {
    hp: p.hp,
    hpMax: p.hp,
    types: p.types,
    status: p.status,
    moves: map(p.moves, (move) => {
      const data = p.getMoveData(move)
      const definition = Dex.moves.getByID(toID(data?.id))
      return definition
    }),
    ability: Dex.abilities.get(p.ability),
  }

  return fighterPlus
}

export type WildlifeFighterPlus = Awaited<
  ReturnType<typeof getWildlifeFighterPlus>
>

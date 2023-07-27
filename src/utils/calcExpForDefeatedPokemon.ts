import { PokemonEffortValueYield } from "~/data/pokemonEffortValueYield"
import { type WildlifeFighterPlus } from "~/server/lib/battle/getWildlifeFighterPlus"
import { type CatchMetadata } from "~/server/schema/CatchMetadata"

export const calcExpForDefeatedPokemon = ({
  defeatedFighter,
  receivingFighter,
  participatedInBattle,
  isOriginalOwner,
  canEvolve,
}: {
  defeatedFighter: Pick<WildlifeFighterPlus, "speciesNum" | "level">
  receivingFighter: Pick<CatchMetadata, "speciesNum" | "level" | "exp">
  participatedInBattle: boolean
  isOriginalOwner: boolean
  canEvolve: boolean
}) => {
  const { speciesNum: defeatedSpeciesNum, level: defeatedLevel } =
    defeatedFighter

  const { level: receivingLevel } = receivingFighter

  const defeatedBaseExp = PokemonEffortValueYield[defeatedSpeciesNum]?.baseExp
  if (!defeatedBaseExp) {
    throw new Error(
      `Could not find baseExp for speciesNum ${defeatedSpeciesNum}}`
    )
  }
  if (typeof receivingLevel !== "number" || receivingLevel < 0) {
    throw new Error(`receiving Pokemon has no level`)
  }
  //b is the base experience yield of the fainted Pokémon's species
  const b = defeatedBaseExp

  //L is the level of the fainted/caught Pokémon
  const L = defeatedLevel

  //s is
  //1 when calculating the experience of a Pokémon that participated in battle
  //2 when calculating the experience of a Pokémon that did not participate in battle and if Exp. Share is turned on
  const s = participatedInBattle ? 1 : 2

  //Lp is the level of the Pokémon that participated in battle
  const Lp = receivingLevel

  //t is
  //1 if the winning Pokémon's current owner is its Original Trainer
  //1.5 if the Pokémon is an outsider Pokémon (i.e. its current owner is not its Original Trainer)
  const t = isOriginalOwner ? 1 : 1.5

  //e is
  //1.5 if the winning Pokémon is holding a Lucky Egg
  //1 otherwise
  const e = 1

  //v is
  //(~1.2) if the winning Pokémon is at or past the level where it would be able to evolve, but it has not
  //1 otherwise
  // Infos here: https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_that_evolve_at_or_above_a_certain_level
  const v = canEvolve ? 1.2 : 1

  //f is friendship stuff
  const f = 1

  //p is exp power boosts
  const p = 1

  const res =
    (((b * L) / 5) * (1 / s) * ((2 * L + 10) / (L + Lp + 10)) ** 2.5 + 1) *
    t *
    e *
    v *
    f *
    p
  // console.log({ b, L, Lp, res })

  return Math.floor(res)
}

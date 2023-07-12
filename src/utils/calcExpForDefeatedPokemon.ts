import { type WildlifeFighterPlus } from "~/server/lib/battle/getWildlifeFighterPlus"

export const calcExpForDefeatedPokemon = ({
  defeatedFighter,
  receivingFighter,
}: {
  defeatedFighter: Pick<WildlifeFighterPlus, "speciesDefinition" | "level">
  receivingFighter: Pick<WildlifeFighterPlus, "speciesDefinition" | "level">
}) => {
  const { speciesDefinition: defeatedSpeciesDefinition, level: defeatedLevel } =
    defeatedFighter
  const { num: defeatedNum } = defeatedSpeciesDefinition
  const {
    speciesDefinition: receivingSpeciesDefinition,
    level: receivingLevel,
  } = receivingFighter
  const { num: receivingNum } = receivingSpeciesDefinition

  //b is the base experience yield of the fainted Pokémon's species
  const b = 1

  //L is the level of the fainted/caught Pokémon
  const L = 1

  //s is
  //1 when calculating the experience of a Pokémon that participated in battle
  //2 when calculating the experience of a Pokémon that did not participate in battle and if Exp. Share is turned on
  const s = 1

  //Lp is the level of the Pokémon that participated in battle
  const Lp = 1

  //t is
  //1 if the winning Pokémon's current owner is its Original Trainer
  //1.5 if the Pokémon is an outsider Pokémon (i.e. its current owner is not its Original Trainer)
  const t = 1

  //e is
  //1.5 if the winning Pokémon is holding a Lucky Egg
  //1 otherwise
  const e = 1

  //v is
  //(~1.2) if the winning Pokémon is at or past the level where it would be able to evolve, but it has not
  //1 otherwise
  const v = 1

  //f is friendship stuff
  const f = 1

  //p is exp power boosts
  const p = 1
  return 0
}

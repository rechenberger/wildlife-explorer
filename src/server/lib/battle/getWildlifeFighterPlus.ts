import { Dex, type PokemonSet } from "@pkmn/dex"
import { Battle, toID, type Pokemon } from "@pkmn/sim"
import { first, mapValues, sum } from "lodash-es"
import { z } from "zod"
import { IV_SCORE_MAX, SHOW_EXACT_IVS } from "~/config"
import {
  WildlifeFighterPlusMove,
  WildlifeFighterPlusMoveNullishDefinition,
  getWildlifeFighterPlusMove,
} from "./WildlifeFighterPlusMove"
import { applyFighterStats } from "./applyFighterStats"
import {
  getNextPossibleEvoByLevel,
  getWildlifeFighter,
  type GetWildlifeFighterOptions,
} from "./getWildlifeFighter"

export const getWildlifeFighterPlus = async (
  options: GetWildlifeFighterOptions
) => {
  const pokemonSet = await getWildlifeFighter(options)

  return transformPokemonSetToPlus({
    pokemonSet,
    catchMetadata: options.metadata,
    isTraded: options.playerId !== options.originalPlayerId,
  })
}

export const transformPokemonSetToPlus = ({
  pokemonSet,
  catchMetadata,
  isTraded,
}: {
  pokemonSet: PokemonSet
  catchMetadata?: GetWildlifeFighterOptions["metadata"]
  isTraded: boolean
}) => {
  const battle = new Battle({
    formatid: toID("gen7randombattle"),
    seed: [13103, 5088, 17178, 48392], // TODO:
  })
  battle.setPlayer("p1", {
    name: "Player",
    team: [pokemonSet],
  })

  const p = first(first(battle.sides)?.pokemon)
  if (!p) {
    throw new Error("Could not build FighterPlus")
  }
  applyFighterStats({ p, catchMetadata })

  return transformWildlifeFighterPlus({
    pokemonSet,
    pokemon: p,
    isTraded,
  })
}

const ivToLabel = ({ iv }: { iv: number }) => {
  if (SHOW_EXACT_IVS) return iv.toString()
  if (iv === 31) return "Best"
  if (iv === 30) return "Fantastic"
  if (iv >= 26) return "Very Good"
  if (iv >= 16) return "Pretty Good"
  if (iv >= 1) return "Decent"
  return "No good"
}

export const transformWildlifeFighterPlus = ({
  pokemonSet,
  pokemon,
  foeTypes,
  isTraded,
}: {
  pokemonSet: PokemonSet
  pokemon: Pokemon
  foeTypes?: string[]
  isTraded: boolean
}) => {
  const p = pokemon

  const nextPossibleEvo = getNextPossibleEvoByLevel({
    species: Dex.species.get(pokemonSet.species),
    level: p.level,
    isTraded,
  })

  const canEvolve = !!nextPossibleEvo

  const moves = p.baseMoveSlots.map((move) => {
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

  const moveRequestMoves = p.getMoveRequestData()?.moves?.map((move) => {
    const plusMove = getWildlifeFighterPlusMove({
      move,
      p,
      foeTypes,
    })

    if (plusMove?.definition.exists === false) {
      return {
        ...plusMove,
        definition: undefined,
      }
    }
    return plusMove
  })

  const nature = Dex.natures.get(pokemonSet.nature)

  const ivLabels = mapValues(pokemonSet.ivs, (iv) => ivToLabel({ iv }))
  const ivScore = Math.floor(
    (IV_SCORE_MAX * sum(Object.values(pokemonSet.ivs))) / 6 / 31
  )
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
    nature: nature,
    stats,
    isActive: p.isActive,
    justFainted: p.side.faintedThisTurn === p,
    lastMove: p.lastMove,
    moveRequestData: {
      trapped: moveRequestData?.trapped,
      moves: moveRequestMoves,
    },
    ivLabels,
    ivScore,
    canEvolve,
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
  nature: z.object({
    name: z.string(),
    plus: z.string().optional(),
    minus: z.string().optional(),
  }),
  stats: z.object({
    hp: z.number(),
    atk: z.number(),
    def: z.number(),
    spa: z.number(),
    spd: z.number(),
    spe: z.number(),
  }),
  ivLabels: z
    .object({
      hp: z.string(),
      atk: z.string(),
      def: z.string(),
      spa: z.string(),
      spd: z.string(),
      spe: z.string(),
    })
    .nullish(),
  ivScore: z.number().nullish(),
  isActive: z.boolean(),
  justFainted: z.boolean(),
  lastMove: z
    .object({
      name: z.string(),
      totalDamage: z.number().or(z.literal(false)).nullish(),
    })
    .nullish(),
  moveRequestData: z
    .object({
      trapped: z.boolean().optional(),
      moves: z.array(WildlifeFighterPlusMoveNullishDefinition).optional(),
    })
    .nullish(),
  canEvolve: z.boolean().nullish(),
})
export type WildlifeFighterPlus = z.infer<typeof WildlifeFighterPlus>

import { Dex } from "@pkmn/dex"
import { type Pokemon } from "@pkmn/sim"
import { z } from "zod"

export const getWildlifeFighterPlusMove = ({
  move,
  foeTypes,
  p,
}: {
  move: {
    id: string
    disabled?: string | boolean
    disabledSource?: string
  }
  foeTypes?: string[]
  p?: Pokemon
}) => {
  const definition = Dex.moves.get(move.id)
  const id = definition.id.toString()

  const status = p ? p.getMoveData(move.id) : null

  const moveType = definition.type
  const immunity = foeTypes ? Dex.getImmunity(moveType, foeTypes) : null
  const effectiveness = foeTypes
    ? Dex.getEffectiveness(moveType, foeTypes)
    : null

  return {
    id,
    name: definition?.name || move.id,
    status,
    definition,
    effectiveness,
    immunity,
    disabled: move.disabled,
    disabledSource: move.disabledSource,
  } satisfies WildlifeFighterPlusMove
}

export const WildlifeFighterPlusMove = z.object({
  name: z.string(),
  id: z.string().optional(), // TODO: make non-optional
  status: z
    .object({
      pp: z.number(),
    })
    .nullish(),
  definition: z.object({
    name: z.string(),
    type: z.string(),
    category: z.string(),
    desc: z.string(),
    basePower: z.number().nullish(),
    accuracy: z.number().or(z.literal(true)),
    pp: z.number(),
  }),
  effectiveness: z.number().nullish(),
  immunity: z.boolean().nullish(),

  disabled: z.string().or(z.boolean()).optional(),
  disabledSource: z.string().optional(),
})

export const WildlifeFighterPlusMoveNullishDefinition =
  WildlifeFighterPlusMove.omit({
    definition: true,
  }).merge(
    z.object({
      definition: WildlifeFighterPlusMove.shape.definition.nullish(),
    })
  )

export type WildlifeFighterPlusMoveNullishDefinition = z.infer<
  typeof WildlifeFighterPlusMoveNullishDefinition
>

export type WildlifeFighterPlusMove = z.infer<typeof WildlifeFighterPlusMove>

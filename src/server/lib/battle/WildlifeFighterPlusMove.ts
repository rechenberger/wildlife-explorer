import { Dex } from "@pkmn/dex"
import { type Pokemon } from "@pkmn/sim"
import { z } from "zod"

export const getWildlifeFighterPlusMove = ({
  move,
  foeTypes,
  p,
}: {
  move: string
  foeTypes?: string[]
  p?: Pokemon
}) => {
  const definition = Dex.moves.get(move)
  const id = definition.id.toString()

  const status = p ? p.getMoveData(move) : null

  const moveType = definition.type
  const immunity = foeTypes ? Dex.getImmunity(moveType, foeTypes) : null
  const effectiveness = foeTypes
    ? Dex.getEffectiveness(moveType, foeTypes)
    : null

  return {
    id,
    name: definition?.name || move,
    status,
    definition,
    effectiveness,
    immunity,
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
})
export type WildlifeFighterPlusMove = z.infer<typeof WildlifeFighterPlusMove>

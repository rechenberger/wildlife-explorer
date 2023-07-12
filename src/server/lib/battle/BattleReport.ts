import { z } from "zod"
import { WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
import { WildlifeFighterPlus } from "./getWildlifeFighterPlus"

export const BattleReport = z.object({
  winner: z.string().optional(),
  inputLog: z.string(),
  outputLog: z.string(),
  version: z.number(),
  sides: z.array(
    z.object({
      name: z.string(),
      fighters: z.array(
        z.object({
          // fighter: z.object({
          //   isActive: z.boolean(),
          //   lastMove: z.any(), // TODO:
          //   justFainted: z.boolean(),
          //   hp: z.number(),
          //   hpMax: z.number(),
          // }),
          fighter: z.any().transform(
            (v) =>
              v as WildlifeFighterPlus & {
                isActive: boolean
                lastMove: any
                justFainted: boolean
              }
          ),
          name: z.string(),
          // catch: z.object({
          //   id: z.string(),
          // }),
          catch: z.any(),
          wildlife: z.object({
            id: z.string(),
            metadata: WildlifeMetadata,
          }),
        })
      ),
      player: z.object({
        id: z.string(),
      }),
      isWinner: z.boolean(),
    })
  ),
  battlePlayerChoices: z.array(
    z.object({
      playerId: z.string(),
      isChoiceDone: z.boolean(),
    })
  ),
})
export type BattleReport = z.infer<typeof BattleReport>

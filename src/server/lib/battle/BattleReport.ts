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
          fighter: WildlifeFighterPlus,
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

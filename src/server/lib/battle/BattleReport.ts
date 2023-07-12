import { z } from "zod"
import { WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
import { WildlifeFighterPlus } from "./getWildlifeFighterPlus"

export const BattleReportFighter = z.object({
  fighter: WildlifeFighterPlus,
  name: z.string().nullish(),
  // catch: z.object({
  //   id: z.string(),
  // }),
  catch: z.any(),
  wildlife: z.object({
    id: z.string(),
    metadata: WildlifeMetadata,
  }),
})

export type BattleReportFighter = z.infer<typeof BattleReportFighter>

export const BattleReportSide = z.object({
  name: z.string(),
  fighters: z.array(BattleReportFighter),
  player: z.object({
    id: z.string(),
  }),
  isWinner: z.boolean(),
})
export type BattleReportSide = z.infer<typeof BattleReportSide>

export const BattleReport = z.object({
  winner: z.string().optional(),
  inputLog: z.string(),
  outputLog: z.string(),
  version: z.number(),
  sides: z.array(BattleReportSide),
  battlePlayerChoices: z.array(
    z.object({
      playerId: z.string(),
      isChoiceDone: z.boolean(),
    })
  ),
})
export type BattleReport = z.infer<typeof BattleReport>

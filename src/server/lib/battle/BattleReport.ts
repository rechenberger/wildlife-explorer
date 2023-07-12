import { z } from "zod"
import { WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
import { WildlifeFighterPlus } from "./getWildlifeFighterPlus"

export const BattleReportWildlifeMetadata = WildlifeMetadata.pick({
  taxonLocaleNames: true,
  taxonCommonName: true,
  taxonName: true,
  taxonImageUrlSquare: true,
})

export const BattleReportFighter = z.object({
  fighter: WildlifeFighterPlus,
  name: z.string().nullish(),
  catch: z
    .object({
      id: z.string(),
    })
    .nullish(),
  wildlife: z.object({
    id: z.string(),
    metadata: BattleReportWildlifeMetadata,
  }),
})

export type BattleReportFighter = z.infer<typeof BattleReportFighter>

export const BattleReportSide = z.object({
  name: z.string(),
  fighters: z.array(BattleReportFighter),
  player: z
    .object({
      id: z.string(),
    })
    .nullish(),
  isWinner: z.boolean(),
})
export type BattleReportSide = z.infer<typeof BattleReportSide>

export const BattleReport = z.object({
  winner: z.string().optional(),
  inputLog: z.array(z.string()),
  outputLog: z.array(z.string()),
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

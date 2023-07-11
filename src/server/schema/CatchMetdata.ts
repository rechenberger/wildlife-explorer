import { z } from "zod"

export const CatchMetadata = z.object({
  speciesNum: z.number().nullish(),
  speciesName: z.string().nullish(),
  levelingRate: z
    .enum([
      "Medium Fast",
      "Erratic",
      "Fluctuating",
      "Medium Slow",
      "Fast",
      "Slow",
    ])
    .nullish(),
  exp: z.number().nullish(),
  level: z.number().nullish(),
  evs: z
    .object({
      hp: z.number(),
      atk: z.number(),
      def: z.number(),
      spa: z.number(),
      spd: z.number(),
      spe: z.number(),
    })
    .nullish(),
})
export type CatchMetadata = z.infer<typeof CatchMetadata>

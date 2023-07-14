import { z } from "zod"
import { getLevelFromExp } from "~/data/pokemonLevelExperienceMap"

export const LevelingRate = z.enum([
  "Medium Fast",
  "Erratic",
  "Fluctuating",
  "Medium Slow",
  "Fast",
  "Slow",
])
export type LevelingRate = z.infer<typeof LevelingRate>

export const CatchMetadata = z
  .object({
    speciesNum: z.number().nullish(),
    speciesName: z.string().nullish(),
    levelingRate: LevelingRate.nullish(),
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
  .refine((data) => {
    if (data.levelingRate && data.exp) {
      data.level = getLevelFromExp(data)
    }
    return true
  })
export type CatchMetadata = z.infer<typeof CatchMetadata>

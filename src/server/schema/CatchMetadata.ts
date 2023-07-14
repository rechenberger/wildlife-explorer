import { z } from "zod"
import { PokemonExperienceMap } from "~/data/pokemonLevelExperienceMap"

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
      const currentLevelBasedOnExp =
        (Object.values(PokemonExperienceMap).find(
          (obj) =>
            obj.requiredExperience > (data.exp ?? 0) &&
            obj.levelingRate === data.levelingRate
        )?.level || 1) - 1

      data.level = currentLevelBasedOnExp
    }
    return true
  })
export type CatchMetadata = z.infer<typeof CatchMetadata>

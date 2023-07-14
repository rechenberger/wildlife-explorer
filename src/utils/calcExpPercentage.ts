import { getExpRate } from "~/data/pokemonLevelExperienceMap"
import { type LevelingRate } from "~/server/schema/CatchMetadata"

export const calcExpPercentage = ({
  exp,
  level,
  levelingRate,
}: {
  exp: number
  level: number | undefined | null
  levelingRate: LevelingRate | undefined | null
}) => {
  if (!level) return null
  if (!levelingRate) return null
  const expThisLevelAbsolute =
    getExpRate({
      level,
      levelingRate,
    })?.requiredExperience ?? 1

  const expNextLevelAbsolute =
    getExpRate({
      level: level + 1,
      levelingRate,
    })?.requiredExperience ?? 1

  const expPercentage = Math.floor(
    ((exp - expThisLevelAbsolute) /
      (expNextLevelAbsolute - expThisLevelAbsolute)) *
      100
  )

  return {
    expPercentage,
    expAbsolute: exp,
    expNextLevelAbsolute: exp,
  }
}

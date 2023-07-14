import { getExpRate } from "~/data/pokemonLevelExperienceMap"
import { type LevelingRate } from "~/server/schema/CatchMetadata"

export const calcExpPercentage = ({
  exp,
  level,
  levelingRate,
}: {
  exp?: number | undefined | null
  level?: number | undefined | null
  levelingRate?: LevelingRate | undefined | null
}) => {
  if (!level) return null
  if (!levelingRate) return null
  if (!exp) return null
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

  let expPercentage = Math.floor(
    ((exp - expThisLevelAbsolute) /
      (expNextLevelAbsolute - expThisLevelAbsolute)) *
      100
  )
  expPercentage = Math.max(Math.min(100, expPercentage), 0)

  return {
    expPercentage,
    expAbsolute: exp,
    expNextLevelAbsolute: exp,
  }
}

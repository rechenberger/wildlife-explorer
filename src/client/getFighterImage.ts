import { some } from "lodash-es"
import {
  FIGHTER_MAX_NUM_RANGES_WITH_BACK_IMAGE,
  FIGHTER_MAX_NUM_WITH_ANIMATION,
} from "~/config"

export const getFighterImage = ({
  fighterSpeciesNum,
  back = false,
  animated = false,
}: {
  fighterSpeciesNum: number
  back?: boolean
  animated?: boolean
}) => {
  const hasAnimatedImg = fighterSpeciesNum <= FIGHTER_MAX_NUM_WITH_ANIMATION
  const hasNonAnimatedBackImg = some(
    FIGHTER_MAX_NUM_RANGES_WITH_BACK_IMAGE,
    (range) => {
      const { from, to } = range
      return fighterSpeciesNum >= from && fighterSpeciesNum <= to
    }
  )

  const showAnimated = animated && hasAnimatedImg
  const showBack =
    back && (showAnimated || (!animated && hasNonAnimatedBackImg))

  const base = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${
    showAnimated ? "/other/showdown" : ""
  }`

  const folder = showBack ? `/back` : ``
  const fighterImgUrl = `${base}${folder}/${fighterSpeciesNum}.${
    showAnimated ? "gif" : "png"
  }`
  return fighterImgUrl
}

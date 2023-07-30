import { FIGHTER_MAX_NUM_WITH_BACK_IMG } from "~/config"

export const getFighterImage = ({
  fighterSpeciesNum,
  back = false,
}: {
  fighterSpeciesNum: number
  back?: boolean
}) => {
  const base = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon`
  if (fighterSpeciesNum > FIGHTER_MAX_NUM_WITH_BACK_IMG) {
    // back images not supported
    back = false
  }

  const folder = back ? "/back" : ""
  const fighterImgUrl = `${base}${folder}/${fighterSpeciesNum}.png`
  return fighterImgUrl
}

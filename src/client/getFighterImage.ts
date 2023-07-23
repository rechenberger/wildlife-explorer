export const getFighterImage = ({
  fighterSpeciesNum,
  back = false,
}: {
  fighterSpeciesNum: number
  back?: boolean
}) => {
  const base = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon`
  const folder = back ? "/back" : ""
  const fighterImgUrl = `${base}${folder}/${fighterSpeciesNum}.png`
  return fighterImgUrl
}

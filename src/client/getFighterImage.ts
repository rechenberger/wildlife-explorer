export const getFighterImage = ({
  fighterSpeciesNum,
}: {
  fighterSpeciesNum: number
}) => {
  const fighterImgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${fighterSpeciesNum}.png`
  return fighterImgUrl
}

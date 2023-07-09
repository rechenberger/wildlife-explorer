export const replaceByWildlife = (text: string) => {
  const regex = /pokemon/gi
  return text.replace(regex, "Wildlife")
}

export const replaceByWildlife = (text: string) => {
  const regex = /pok[eé]mon/gi
  return text.replace(regex, "Wildlife")
}

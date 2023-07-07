import { type Wildlife } from "@prisma/client"
import { type WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
import { charizard, pikachu } from "./predefinedTeam"

export const getWildlifeFighter = ({
  wildlife,
  isCaught,
  seed,
  locale,
}: {
  wildlife: Wildlife & { metadata: WildlifeMetadata }
  isCaught: boolean
  seed: string
  locale: "de" | "en"
}) => {
  const base = isCaught ? pikachu : charizard
  return {
    ...base,
    name:
      wildlife.metadata.taxonLocaleNames?.[locale] ||
      wildlife.metadata.taxonCommonName ||
      wildlife.metadata.taxonName,
  }
}

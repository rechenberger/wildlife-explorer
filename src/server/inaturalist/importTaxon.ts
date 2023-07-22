import { Dex } from "@pkmn/dex"
import { last } from "lodash-es"
import { type MyPrismaClient } from "../db"
import { taxonMappingByAncestors } from "../lib/battle/taxonMappingByAncestors"
import { findTaxon } from "./findTaxon"

export const importTaxon = async ({
  prisma,
  taxonId,
  playerId,
}: {
  prisma: MyPrismaClient
  taxonId: number
  playerId: string
}) => {
  const id = taxonId
  const existing = await prisma.taxon.findUnique({
    where: {
      id,
    },
  })
  if (existing) return

  console.log("importTaxon", taxonId)
  const metadata = await findTaxon({ taxonId })
  const mapping = taxonMappingByAncestors([
    ...metadata.taxonAncestorIds,
    taxonId,
  ])

  let ancestorId = last(metadata.taxonAncestorIds) ?? null
  if (ancestorId && ancestorId < 2) ancestorId = null
  if (ancestorId) {
    await importTaxon({ prisma, taxonId: ancestorId, playerId })
  }

  const fighterSpeciesName = mapping.pokemon
  const fighterSpeciesNum = Dex.species.get(fighterSpeciesName)?.num
  if (!fighterSpeciesNum) throw new Error("no fighterSpeciesNum")
  const mainMapping = mapping.taxonId
  const isMainMapping = mapping.taxonId === taxonId
  if (!isMainMapping) {
    await importTaxon({ prisma, taxonId: mainMapping, playerId })
  }
  const foundById = playerId
  const ancestorMappedId = isMainMapping ? null : mainMapping
  await prisma.taxon.create({
    data: {
      id,
      metadata,
      foundById,
      ancestorMappedId,
      ancestorId,
      fighterSpeciesName,
      fighterSpeciesNum,
    },
  })
}

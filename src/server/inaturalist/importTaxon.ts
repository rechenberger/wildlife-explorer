import { Dex } from "@pkmn/dex"
import { last } from "lodash-es"
import { type MyPrismaClient } from "../db"
import { taxonMappingByAncestors } from "../lib/battle/taxonMappingByAncestors"
import { findTaxon } from "./findTaxon"

export const importTaxon = async ({
  prisma,
  taxonId,
  playerId,
  createdAt,
}: {
  prisma: MyPrismaClient
  taxonId: number
  playerId: string
  createdAt?: Date
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

  // 48460 is always the root taxon??
  if (ancestorId && ancestorId === 48460) ancestorId = null

  if (ancestorId) {
    await importTaxon({ prisma, taxonId: ancestorId, playerId, createdAt })
  }

  const fighterSpeciesName = mapping.pokemon
  const fighterSpeciesNum = Dex.species.get(fighterSpeciesName)?.num
  if (!fighterSpeciesNum) throw new Error("no fighterSpeciesNum")
  const mainMapping = mapping.taxonId
  const isAnchor = mapping.taxonId === taxonId
  if (!isAnchor) {
    await importTaxon({ prisma, taxonId: mainMapping, playerId })
  }
  const foundById = playerId
  const anchorId = isAnchor ? null : mainMapping
  await prisma.taxon.create({
    data: {
      id,
      metadata,
      foundById,
      isAnchor,
      anchorId,
      ancestorId,
      fighterSpeciesName,
      fighterSpeciesNum,
      createdAt,
    },
  })
}

import { type Taxon } from "@prisma/client"
import { last } from "lodash-es"
import { type MyPrismaClient } from "../db"
import { type TaxonMetadata } from "../schema/TaxonMetadata"
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
}): Promise<Taxon & { metadata: TaxonMetadata }> => {
  const id = taxonId
  const existing = await prisma.taxon.findUnique({
    where: {
      id,
    },
  })
  if (existing) return existing

  console.log("importTaxon", taxonId)
  let metadata: TaxonMetadata

  let retries = 0
  while (true) {
    try {
      metadata = await findTaxon({ taxonId })
      break
    } catch (e: any) {
      console.error(e?.message || e)
      retries++
      const timeout = Math.min(1000 * 2 ** retries, 1000 * 60 * 5)
      console.log(`importTaxon: Retry (${retries}) in ${timeout / 1000}s ...`)
      await new Promise((resolve) => setTimeout(resolve, timeout))
    }
  }

  let ancestorId = last(metadata.taxonAncestorIds) ?? null

  // 48460 is always the root taxon??
  if (ancestorId && ancestorId === 48460) ancestorId = null
  if (!ancestorId) {
    throw new Error(`no ancestorId for taxonId: ${taxonId}`)
  }

  const ancestor = await importTaxon({
    prisma,
    taxonId: ancestorId,
    playerId,
    createdAt,
  })

  // const mapping = taxonMappingByAncestors([
  //   ...metadata.taxonAncestorIds,
  //   taxonId,
  // ])
  // const fighterSpeciesName = mapping.pokemon
  // const fighterSpeciesNum = Dex.species.get(fighterSpeciesName)?.num
  // if (!fighterSpeciesNum) throw new Error("no fighterSpeciesNum")
  // const mainMapping = mapping.taxonId
  // const isAnchor = mapping.taxonId === taxonId
  const isAnchor = false
  const fighterSpeciesName = ancestor.fighterSpeciesName
  const fighterSpeciesNum = ancestor.fighterSpeciesNum
  // if (!isAnchor) {
  //   await importTaxon({ prisma, taxonId: mainMapping, playerId })
  // }
  const foundById = playerId
  const anchorId = ancestor.anchorId
  return await prisma.taxon.create({
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

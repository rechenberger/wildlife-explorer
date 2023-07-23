import { type Taxon } from "@prisma/client"
import { last } from "lodash-es"
import { MAX_RETRIES_IMPORT_TAXON, WEIRD_ROOT_TAXON_ID } from "~/config"
import { type MyPrismaClient } from "../db"
import { type TaxonMetadata } from "../schema/TaxonMetadata"
import { findTaxon } from "./findTaxon"

export type ImportedTaxon = Taxon & { metadata: TaxonMetadata }

export const importTaxon = async ({
  prisma,
  taxonId,
  playerId,
  createdAt,
  preFilteredExisting,
}: {
  prisma: MyPrismaClient
  taxonId: number
  playerId: string
  preFilteredExisting?: boolean
  createdAt?: Date
}): Promise<ImportedTaxon> => {
  const id = taxonId
  if (!preFilteredExisting) {
    const existing = await prisma.taxon.findUnique({
      where: {
        id,
      },
    })
    if (existing) return existing
  }

  // console.log("importTaxon", taxonId)
  let metadata: TaxonMetadata

  let retries = 0
  while (true) {
    try {
      metadata = await findTaxon({ taxonId })
      break
    } catch (e: any) {
      console.error(e?.message || e)
      retries++
      if (retries > MAX_RETRIES_IMPORT_TAXON) throw e
      const timeout = Math.min(1000 * 2 ** retries, 1000 * 60 * 5)
      console.log(`importTaxon: Retry (${retries}) in ${timeout / 1000}s ...`)
      await new Promise((resolve) => setTimeout(resolve, timeout))
    }
  }

  let ancestorId = last(metadata.taxonAncestorIds) ?? null

  // 48460 is always the root taxon??
  if (ancestorId && ancestorId === WEIRD_ROOT_TAXON_ID) ancestorId = null
  if (!ancestorId) {
    throw new Error(`no ancestorId for taxonId: ${taxonId}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ancestor = await importTaxon({
    prisma,
    taxonId: ancestorId,
    playerId,
    createdAt,
  })

  // MAPPING BY AI:
  // const mapping = taxonMappingByAncestors([
  //   ...metadata.taxonAncestorIds,
  //   taxonId,
  // ])
  // const fighterSpeciesName = mapping.pokemon
  // const fighterSpeciesNum = Dex.species.get(fighterSpeciesName)?.num
  // if (!fighterSpeciesNum) throw new Error("no fighterSpeciesNum")
  // const mainMapping = mapping.taxonId
  // const isAnchor = mapping.taxonId === taxonId
  // const anchorId = isAnchor ? null : mainMapping

  // MAPPING BY DB:
  const fighterSpeciesName = ancestor.fighterSpeciesName
  const fighterSpeciesNum = ancestor.fighterSpeciesNum
  const isAnchor = false
  const anchorId = ancestor.anchorId

  const foundById = playerId
  return await prisma.taxon.upsert({
    where: {
      id,
    },
    create: {
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
    update: {
      metadata,
      isAnchor,
      anchorId,
      ancestorId,
      fighterSpeciesName,
      fighterSpeciesNum,
    },
  })
}

import { type Wildlife } from "@prisma/client"
import { subSeconds } from "date-fns"
import { chunk, filter, flatMap, map, uniqBy } from "lodash-es"
import {
  DEFAULT_DB_CHUNK_SIZE,
  LOG_SCAN_TIME,
  RADIUS_IN_KM_SCAN_WILDLIFE_BIG,
  RADIUS_IN_KM_SCAN_WILDLIFE_SMALL,
} from "~/config"
import { type MyPrismaClient } from "~/server/db"
import { findObservations } from "~/server/inaturalist/findObservations"
import { type LatLng } from "~/server/schema/LatLng"
import { importTaxon } from "../inaturalist/importTaxon"
import { WildlifeMetadata } from "../schema/WildlifeMetadata"

export const scanWildlife = async ({
  location,
  prisma,
  playerId,
}: {
  location: LatLng
  prisma: MyPrismaClient
  playerId: string
}) => {
  LOG_SCAN_TIME && console.time("scanWildlife")
  LOG_SCAN_TIME && console.time("findObservations")
  const observationsMultiRadius = await Promise.all([
    findObservations({
      lat: location.lat,
      lng: location.lng,
      radiusInKm: RADIUS_IN_KM_SCAN_WILDLIFE_SMALL,
    }),
    findObservations({
      lat: location.lat,
      lng: location.lng,
      radiusInKm: RADIUS_IN_KM_SCAN_WILDLIFE_BIG,
    }),
  ])
  LOG_SCAN_TIME && console.timeEnd("findObservations")

  const observations = uniqBy(
    flatMap(observationsMultiRadius, (o) => o),
    (o) => o.observationId
  )

  LOG_SCAN_TIME && console.time("importTaxon")
  const taxonIds = uniqBy(
    map(observations, (o) => o.taxonId),
    (id) => id
  )
  console.log(`Importing ${taxonIds.length} taxons`)
  const importedTaxons = await Promise.all(
    map(taxonIds, async (taxonId) => {
      try {
        return await importTaxon({ prisma, taxonId, playerId })
      } catch (error) {
        console.error(`Could not import taxon ${taxonId}`)
        throw error
      }
    })
  )
  LOG_SCAN_TIME && console.timeEnd("importTaxon")

  const now = new Date()
  const chunks = chunk(observations, DEFAULT_DB_CHUNK_SIZE)
  const wildlifes: Wildlife[] = []
  for (const chunk of chunks) {
    const chunkResult = await Promise.all(
      map(chunk, async (o) => {
        const data = {
          observationId: o.observationId,
          lat: o.lat,
          lng: o.lng,
          metadata: WildlifeMetadata.parse(o),
          taxonId: o.taxonId,
        }
        return await prisma.wildlife.upsert({
          where: {
            observationId: o.observationId,
          },
          create: {
            ...data,
            respawnsAt: new Date(),
            foundById: playerId,
          },
          update: data,
        })
      })
    )
    wildlifes.push(...chunkResult)
  }

  const minCreatedAt = subSeconds(now, 10)
  const countAll = wildlifes.length
  const countFound = filter(
    wildlifes,
    (w) => w.foundById === playerId && w.createdAt >= minCreatedAt
  ).length

  const countTaxons = taxonIds.length
  const countTaxonsFound = filter(
    importedTaxons,
    (w) => w.foundById === playerId && w.createdAt >= minCreatedAt
  ).length

  LOG_SCAN_TIME && console.timeEnd("scanWildlife")

  return {
    countAll,
    countFound,
    countTaxons,
    countTaxonsFound,
  }
}

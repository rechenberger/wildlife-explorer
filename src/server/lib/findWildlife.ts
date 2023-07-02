import { type PrismaClient } from "@prisma/client"
import { map } from "lodash-es"
import { findObservations } from "../inaturalist/findObservations"

export const findWildlife = async ({
  lat,
  lng,
  radiusInKm,
  prisma,
  playerId,
}: {
  lat: number
  lng: number
  radiusInKm: number
  prisma: PrismaClient
  playerId: string
}) => {
  const observations = await findObservations({ lat, lng, radiusInKm })
  const catches = await prisma.catch.findMany({
    where: {
      playerId,
    },
  })
  const x = map(observations, (observation) => {
    return {
      ...observation,
      caughtAt: catches.find((c) => c.observationId === observation.id)
        ?.createdAt,
    }
  })

  const y = await Promise.all(
    map(x, async (w) => {
      const status = await prisma.observationStatus.findUnique({
        where: {
          id: w.id,
        },
      })
      return {
        ...w,
        status,
      }
    })
  )

  return y
}

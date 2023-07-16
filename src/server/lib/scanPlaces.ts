import { type Place } from "@prisma/client"
import { subSeconds } from "date-fns"
import { chunk, filter, map } from "lodash-es"
import { DEFAULT_DB_CHUNK_SIZE } from "~/config"
import { type MyPrismaClient } from "../db"
import { type LatLng } from "../schema/LatLng"
import { type PlaceMetadata } from "../schema/PlaceMetadata"
import { findPlaces } from "./findPlaces"

export const scanPlaces = async ({
  location,
  prisma,
  playerId,
}: {
  location: LatLng
  prisma: MyPrismaClient
  playerId: string
}) => {
  const placesRaw = await findPlaces({ location })

  const places: Place[] = []
  const chunks = chunk(placesRaw, DEFAULT_DB_CHUNK_SIZE)
  for (const chunk of chunks) {
    const chunkResult = await Promise.all(
      map(chunk, async (p) => {
        const data = {
          googlePlaceId: p.googlePlaceId,
          lat: p.lat,
          lng: p.lng,
          type: p.type,
          metadata: {} satisfies PlaceMetadata,
        }
        return await prisma.place.upsert({
          where: {
            googlePlaceId: p.googlePlaceId,
          },
          create: {
            ...data,
            foundById: playerId,
          },
          update: data,
        })
      })
    )
    places.push(...chunkResult)
  }

  const minCreatedAt = subSeconds(new Date(), 10)
  const countAll = places.length
  const countFound = filter(
    places,
    (p) => p.foundById === playerId && p.createdAt >= minCreatedAt
  ).length

  return {
    countAll,
    countFound,
  }
}

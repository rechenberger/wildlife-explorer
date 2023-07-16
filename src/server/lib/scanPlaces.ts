import { chunk, map } from "lodash-es"
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
  const places = await findPlaces({ location })

  const chunks = chunk(places, DEFAULT_DB_CHUNK_SIZE)
  for (const chunk of chunks) {
    await Promise.all(
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
  }
}

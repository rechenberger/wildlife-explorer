import { Client } from "@googlemaps/google-maps-services-js"
import { PlaceType } from "@prisma/client"
import { filter, flatMap, some } from "lodash-es"
import { RADIUS_IN_KM_SCAN_PLACES } from "~/config"
import { env } from "~/env.mjs"
import { type LatLng } from "../schema/LatLng"
import { type PlaceMetadata } from "../schema/PlaceMetadata"

const types = [
  {
    googleMapsType: "veterinary_care",
    dbType: PlaceType.CARE_CENTER,
  },
  {
    googleMapsType: "airport",
    placeDenyList: ["parking"],
    mustBeOpen: true,
    dbType: PlaceType.AIRPORT,
  },
]

export const findPlaces = async ({ location }: { location: LatLng }) => {
  const places = await Promise.all(
    types.map(async (t) => {
      const places = await findPlacesByType({
        location,
        type: t.googleMapsType,
        mustBeOpen: t.mustBeOpen,
        placeDenyList: t.placeDenyList,
      })
      return places.map((p) => {
        return {
          googlePlaceId: p.googlePlaceId,
          lat: p.lat,
          lng: p.lng,
          type: t.dbType,
          metadata: {
            name: p.name,
          } satisfies PlaceMetadata,
        }
      })
    })
  )

  return places.flat()
}

export const findPlacesByType = async ({
  location,
  type,
  mustBeOpen,
  placeDenyList,
}: {
  location: LatLng
  type: string
  mustBeOpen?: boolean
  placeDenyList?: string[]
}) => {
  try {
    const client = new Client({})
    const result = await client.placesNearby({
      params: {
        location, // Replace with player's location
        radius: RADIUS_IN_KM_SCAN_PLACES * 1000, // Search within a 5km radius
        type,
        key: env.GOOGLE_MAPS_PLACES_API_KEY,
      },
      timeout: 1000, // milliseconds
    })
    if (result.data.status !== "OK") {
      console.log(result.data.error_message)
      throw new Error(`Google Maps API error: ${result.data.error_message}`)
    }

    let results = result.data.results

    if (mustBeOpen) {
      results = filter(results, (r) => {
        return !!r.opening_hours?.open_now
      })
    }

    if (placeDenyList) {
      results = filter(results, (r) => {
        return !some(placeDenyList, (d) => !!r.types?.includes(d as any))
      })
    }

    const places = results.map((p) => {
      return {
        name: p.name,
        lat: p.geometry?.location.lat,
        lng: p.geometry?.location.lng,
        googlePlaceId: p.place_id,
      }
    })

    const goodPlaces = flatMap(places, (p) => {
      if (!p.lat || !p.lng || !p.googlePlaceId) {
        return []
      }
      return [
        {
          ...p,
          lat: p.lat!,
          lng: p.lng!,
          googlePlaceId: p.googlePlaceId!,
        },
      ]
    })

    return goodPlaces
  } catch (e) {
    console.error(e)
    return []
  }
}

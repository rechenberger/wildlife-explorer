import { Client } from "@googlemaps/google-maps-services-js"
import { PlaceType } from "@prisma/client"
import { RADIUS_IN_KM_SCAN_PLACES } from "~/config"
import { env } from "~/env.mjs"
import { type LatLng } from "../schema/LatLng"

export const findPlaces = async ({ location }: { location: LatLng }) => {
  const client = new Client({})
  const result = await client.placesNearby({
    params: {
      location, // Replace with player's location
      radius: RADIUS_IN_KM_SCAN_PLACES * 1000, // Search within a 5km radius
      type: "veterinary_care", // Search for veterinary clinics
      key: env.GOOGLE_MAPS_PLACES_API_KEY,
    },
    timeout: 1000, // milliseconds
  })
  if (result.data.status !== "OK") {
    console.log(result.data.error_message)
    throw new Error(`Google Maps API error: ${result.data.error_message}`)
  }

  const results = result.data.results

  const places = results.map((p) => {
    return {
      name: p.name,
      lat: p.geometry?.location.lat,
      lng: p.geometry?.location.lng,
      type: PlaceType.CARE_CENTER,
      googlePlaceId: p.place_id,
    }
  })

  console.log(places)

  return places
}

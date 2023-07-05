import { z } from "zod"

export const LatLng = z.object({
  lat: z.number(),
  lng: z.number(),
})

export type LatLng = z.infer<typeof LatLng>

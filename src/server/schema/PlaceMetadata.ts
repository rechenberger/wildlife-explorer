import { z } from "zod"

export const PlaceMetadata = z.object({})
export type PlaceMetadata = z.infer<typeof PlaceMetadata>

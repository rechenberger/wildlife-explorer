import { z } from "zod"

export const PlaceMetadata = z.object({
  name: z.string().nullish(),
})
export type PlaceMetadata = z.infer<typeof PlaceMetadata>

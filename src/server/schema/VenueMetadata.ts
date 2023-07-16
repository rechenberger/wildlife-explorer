import { z } from "zod"

export const VenueMetadata = z.object({})
export type VenueMetadata = z.infer<typeof VenueMetadata>

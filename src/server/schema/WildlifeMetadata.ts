import { z } from "zod"

export const WildlifeMetadata = z.object({
  observationId: z.number(),
  taxonId: z.number(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  taxonImageUrlSquare: z.string().nullable(),
  taxonImageUrlMedium: z.string().nullable(),
  taxonImageUrlSmall: z.string().nullable(),
  observationUrl: z.string(),
  wikiUrl: z.string().nullable(),
  taxonAncestorIds: z.array(z.number()),
  taxonSearchRank: z.number(),
  taxonRank: z.string(),
  taxonObservationsCount: z.number(),
  taxonName: z.string(),
  taxonCommonName: z.string().nullable(),
  observationPositionalAccuracy: z.number().nullable(),
  observationAt: z.string().nullable(),
  observationCaptive: z.boolean(),
  observationUserId: z.number(),
})

export type WildlifeMetadata = z.infer<typeof WildlifeMetadata>

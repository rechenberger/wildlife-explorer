import { z } from "zod"

export const WildlifeMetadata = z.object({
  name: z.string(),
  lat: z.number(),
  lng: z.number(),

  taxonId: z.number(),
  taxonImageUrlSquare: z.string().nullable(),
  taxonImageUrlMedium: z.string().nullable(),
  taxonImageUrlSmall: z.string().nullable(),
  taxonWikiUrl: z.string().nullable(),
  taxonAncestorIds: z.array(z.number()),
  taxonSearchRank: z.number(),
  taxonRank: z.string(),
  taxonObservationsCount: z.number(),
  taxonName: z.string(),
  taxonCommonName: z.string().nullable(),
  taxonLocaleNames: z.record(z.string().nullish()).nullish(),

  observationId: z.number(),
  observationUrl: z.string(),
  observationPositionalAccuracy: z.number().nullable(),
  observationAt: z.string().nullable(),
  observationCaptive: z.boolean(),
  observationUserId: z.number(),
})

export type WildlifeMetadata = z.infer<typeof WildlifeMetadata>

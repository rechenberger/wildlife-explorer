import { z } from "zod"

export const WildlifeMetadata = z.object({
  lat: z.number(),
  lng: z.number(),

  taxonId: z.number(),
  taxonImageUrlSquare: z.string().nullable(),
  taxonImageUrlMedium: z.string().nullable(),
  taxonImageUrlSmall: z.string().nullable(),
  taxonImageLicenseCode: z.string().nullish(),
  taxonImageAttribution: z.string().nullish(),
  taxonWikiUrl: z.string().nullable(),
  taxonAncestorIds: z.array(z.number()),
  taxonSearchRank: z.number(),
  taxonRank: z.string(),
  taxonObservationsCount: z.number(),
  taxonName: z.string(),
  taxonCommonName: z.string().nullable(),
  taxonLocaleNames: z
    .object({
      en: z.string().nullable(),
      de: z.string().nullable(),
    })
    .optional(),

  observationId: z.number(),
  observationUrl: z.string(),
  observationPositionalAccuracy: z.number().nullable(),
  observationAt: z.string().nullable(),
  observationCaptive: z.boolean(),
  observationUserId: z.number(),
  observationUserName: z.string().nullish(),
  observationImageUrlSquare: z.string().optional(),
  observationImageUrlMedium: z.string().optional(),
  observationIsDead: z.boolean().nullish(),
  observationImageLicenseCode: z.string().nullish(),
  observationImageAttribution: z.string().nullish(),
  observationLicenseCode: z.string().nullish(),
})

export type WildlifeMetadata = z.infer<typeof WildlifeMetadata>

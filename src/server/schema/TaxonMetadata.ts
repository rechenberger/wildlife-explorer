import { z } from "zod"

export const TaxonMetadata = z.object({
  taxonId: z.number(),
  taxonImageUrlSquare: z.string().nullable(),
  taxonImageUrlMedium: z.string().nullable(),
  taxonImageUrlSmall: z.string().nullable(),
  taxonImageLicenseCode: z.string().nullish(),
  taxonImageAttribution: z.string().nullish(),
  taxonWikiUrl: z.string().nullable(),
  taxonAncestorIds: z.array(z.number()),
  taxonSearchRank: z.number().nullish(),
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
})

export type TaxonMetadata = z.infer<typeof TaxonMetadata>

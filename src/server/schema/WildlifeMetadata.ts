import { z } from "zod"
import { TaxonMetadata } from "./TaxonMetadata"

export const WildlifeMetadata = TaxonMetadata.merge(
  z.object({
    lat: z.number(),
    lng: z.number(),

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
)

export type WildlifeMetadata = z.infer<typeof WildlifeMetadata>

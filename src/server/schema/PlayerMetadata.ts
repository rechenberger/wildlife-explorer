import { z } from "zod"

export const PlayerMetadata = z.object({
  // navigation: z.object({}).nullish(),
})

export type PlayerMetadata = z.infer<typeof PlayerMetadata>

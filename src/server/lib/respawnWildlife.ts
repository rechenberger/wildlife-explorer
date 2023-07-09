import { type PrismaClient } from "@prisma/client"
import { addMinutes } from "date-fns"
import { DEFAULT_RESPAWN_TIME_IN_MINUTES } from "~/config"

export const respawnWildlife = async ({
  prisma,
  wildlifeId,
}: {
  prisma: PrismaClient
  wildlifeId: string
}) => {
  const respawnsAt = addMinutes(new Date(), DEFAULT_RESPAWN_TIME_IN_MINUTES)
  await prisma.wildlife.update({
    where: {
      id: wildlifeId,
    },
    data: {
      respawnsAt,
    },
  })
}

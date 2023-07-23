import { addMinutes } from "date-fns"
import { RESPAWN_TIME_IN_MINUTES } from "~/config"
import { type MyPrismaClient } from "../db"

type RespawnReason = keyof typeof RESPAWN_TIME_IN_MINUTES

export const respawnWildlife = async ({
  prisma,
  wildlifeId,
  reason,
}: {
  prisma: MyPrismaClient
  wildlifeId: string
  reason: RespawnReason
}) => {
  const respawnTimeInMinutes = RESPAWN_TIME_IN_MINUTES[reason]
  const respawnsAt = addMinutes(new Date(), respawnTimeInMinutes)
  await prisma.wildlife.update({
    where: {
      id: wildlifeId,
    },
    data: {
      respawnsAt,
    },
  })
}

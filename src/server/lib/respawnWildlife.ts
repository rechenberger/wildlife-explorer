import { addMinutes } from "date-fns"
import { DEFAULT_RESPAWN_TIME_IN_MINUTES } from "~/config"
import { type MyPrismaClient } from "../db"

export const respawnWildlife = async ({
  prisma,
  wildlifeId,
}: {
  prisma: MyPrismaClient
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

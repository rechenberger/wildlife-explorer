import { type PrismaClient } from "@prisma/client"
import { map } from "lodash-es"
import { BattleMetadata } from "~/server/schema/BattleMetadata"
import { BattleParticipationMetadata } from "~/server/schema/BattleParticipationMetadata"

export const getBattleForSimulation = async ({
  prisma,
  battleId,
}: {
  prisma: PrismaClient
  battleId: string
}) => {
  const battleRaw = await prisma.battle.findUniqueOrThrow({
    where: {
      id: battleId,
    },
    include: {
      battleParticipants: {
        include: {
          player: true,
          wildlife: true,
        },
      },
    },
  })
  const battleDb = {
    ...battleRaw,
    metadata: BattleMetadata.parse(battleRaw.metadata),
    battleParticipants: map(
      battleRaw.battleParticipants,
      (battleParticipant) => ({
        ...battleParticipant,
        metadata: BattleParticipationMetadata.parse(battleParticipant.metadata),
      })
    ),
  }
  return battleDb
}

import { map } from "lodash-es"
import { type MyPrismaClient } from "~/server/db"
import { BattleMetadata } from "~/server/schema/BattleMetadata"
import { BattleParticipationMetadata } from "~/server/schema/BattleParticipationMetadata"
import { PlayerMetadata } from "~/server/schema/PlayerMetadata"
import { WildlifeMetadata } from "~/server/schema/WildlifeMetadata"

export const getBattleForSimulation = async ({
  prisma,
  battleId,
  playerPartyLimit,
}: {
  prisma: MyPrismaClient
  battleId: string
  playerPartyLimit: number
}) => {
  const battleRaw = await prisma.battle.findUniqueOrThrow({
    where: {
      id: battleId,
    },
    include: {
      battleParticipants: {
        include: {
          player: {
            include: {
              catches: {
                where: {
                  battleOrderPosition: {
                    not: null,
                  },
                },
                include: {
                  wildlife: true,
                },
                take: playerPartyLimit,
                orderBy: {
                  battleOrderPosition: "asc",
                },
              },
            },
          },
          wildlife: true,
        },
        orderBy: {
          id: "asc",
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
        wildlife: battleParticipant.wildlife
          ? {
              ...battleParticipant.wildlife,
              metadata: WildlifeMetadata.parse(
                battleParticipant.wildlife.metadata
              ),
            }
          : undefined,
        player: battleParticipant.player
          ? {
              ...battleParticipant.player,
              metadata: PlayerMetadata.parse(battleParticipant.player.metadata),
              catches: map(battleParticipant.player.catches, (c) => ({
                ...c,
                wildlife: {
                  ...c.wildlife,
                  metadata: WildlifeMetadata.parse(c.wildlife.metadata),
                },
              })),
            }
          : undefined,
      })
    ),
  }
  return battleDb
}

import { type MyPrismaClient } from "~/server/db"
import { WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
import { BattleReportWildlifeMetadata } from "./BattleReport"

const BattleSimulationWildlifeMetadata = BattleReportWildlifeMetadata.merge(
  WildlifeMetadata.pick({
    taxonAncestorIds: true,
  })
)

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
    select: {
      id: true,
      metadata: true,
      battleParticipants: {
        select: {
          id: true,
          player: {
            select: {
              id: true,
              name: true,
              catches: {
                where: {
                  battleOrderPosition: {
                    not: null,
                  },
                },
                select: {
                  id: true,
                  seed: true,
                  name: true,
                  wildlife: {
                    select: {
                      id: true,
                      metadata: true,
                      observationId: true,
                      respawnsAt: true,
                    },
                  },
                },
                take: playerPartyLimit,
                orderBy: {
                  battleOrderPosition: "asc",
                },
              },
            },
          },
          wildlife: {
            select: {
              id: true,
              metadata: true,
              observationId: true,
              respawnsAt: true,
            },
          },
        },
        orderBy: {
          id: "asc",
        },
      },
    },
  })
  const battle = {
    ...battleRaw,
    battleParticipants: battleRaw.battleParticipants.map((bp) => ({
      ...bp,
      wildlife: bp.wildlife
        ? {
            ...bp.wildlife,
            // This is for optimizing the size of metadata:
            metadata: BattleSimulationWildlifeMetadata.parse(
              bp.wildlife.metadata
            ),
          }
        : null,
      player: bp.player
        ? {
            ...bp.player,
            catches: bp.player.catches.map((c) => ({
              ...c,
              wildlife: {
                ...c.wildlife,
                metadata: BattleSimulationWildlifeMetadata.parse(
                  c.wildlife.metadata
                ),
              },
            })),
          }
        : null,
    })),
  }
  return battle
}

// export const BattleInput = z.object({
//   id: z.string(),
//   metadata: BattleMetadata,
//   // ...
// })

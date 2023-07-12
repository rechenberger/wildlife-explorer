import { type MyPrismaClient } from "~/server/db"
import { BattleReportWildlifeMetadata } from "./BattleReport"

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
                      observationId: true, // TODO: remove
                      respawnsAt: true, // TODO: remove
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
            metadata: {
              // This is for optimizing the size of metadata:
              ...BattleReportWildlifeMetadata.parse(bp.wildlife.metadata),
              taxonAncestorIds: bp.wildlife.metadata.taxonAncestorIds,
            },
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

import { type MyPrismaClient } from "~/server/db"

export const getBattleForSimulation = async ({
  prisma,
  battleId,
  playerPartyLimit,
}: {
  prisma: MyPrismaClient
  battleId: string
  playerPartyLimit: number
}) => {
  const battle = await prisma.battle.findUniqueOrThrow({
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
              metadata: true, // TODO: remove
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
  return battle
}

// export const BattleInput = z.object({
//   id: z.string(),
//   metadata: BattleMetadata,
//   // ...
// })

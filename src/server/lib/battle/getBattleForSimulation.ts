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
  return battle
}

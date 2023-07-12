import { createTRPCRouter } from "~/server/api/trpc"
import { playerProcedure } from "../middleware/playerProcedure"

export const socialRouter = createTRPCRouter({
  getOverview: playerProcedure.query(async ({ ctx }) => {
    const players = await ctx.prisma.player.findMany({
      // where: {
      //   id: {
      //     not: input.playerId,
      //   },
      // },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        _count: {
          select: {
            catches: true,
            battleParticipations: {
              where: {
                isWinner: true,
              },
            },
            foundWildlife: true,
          },
        },
      },
    })

    return players
  }),
})

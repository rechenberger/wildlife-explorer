import { map } from "lodash-es"
import { createTRPCRouter } from "~/server/api/trpc"
import { parsePlayer } from "~/server/schema/parsePlayer"
import { playerProcedure } from "../middleware/playerProcedure"

export const socialRouter = createTRPCRouter({
  getOverview: playerProcedure.query(async ({ ctx }) => {
    const playersRaw = await ctx.prisma.player.findMany({
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

    const players = map(playersRaw, parsePlayer)

    return players
  }),
})

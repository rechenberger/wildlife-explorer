import { createTRPCRouter } from "~/server/api/trpc"
import { PlayerMetadata } from "~/server/schema/PlayerMetadata"
import { playerProcedure } from "../middleware/playerProcedure"

export const socialRouter = createTRPCRouter({
  getOverview: playerProcedure.query(async ({ ctx }) => {
    const playersRaw = await ctx.prisma.player.findMany({
      // where: {
      //   id: {
      //     not: input.playerId,
      //   },
      // },
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

    const players = playersRaw.map((player) => ({
      ...player,
      metadata: PlayerMetadata.parse(player.metadata),
    }))

    return players
  }),
})

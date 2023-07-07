import { z } from "zod"
import { createTRPCRouter } from "~/server/api/trpc"
import { playerProcedure } from "../middleware/playerProcedure"

export const battleRouter = createTRPCRouter({
  attackWildlife: playerProcedure
    .input(
      z.object({
        wildlifeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.battle.create({
        data: {
          status: "IN_PROGRESS",
          metadata: {},
          battleParticipants: {
            createMany: {
              data: [
                {
                  playerId: ctx.player.id,
                  metadata: {},
                },
                {
                  wildlifeId: input.wildlifeId,
                  metadata: {},
                },
              ],
            },
          },
        },
      })
    }),
})

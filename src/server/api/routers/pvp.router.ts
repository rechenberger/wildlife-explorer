import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter } from "~/server/api/trpc"
import { type BattleMetadata } from "~/server/schema/BattleMetadata"
import { type BattleParticipationMetadata } from "~/server/schema/BattleParticipationMetadata"
import { playerProcedure } from "../middleware/playerProcedure"

export const pvpRouter = createTRPCRouter({
  startPvp: playerProcedure
    .input(
      z.object({
        otherPlayerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.player.metadata?.activeBattleId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already in a battle",
        })
      }

      const battle = await ctx.prisma.battle.create({
        data: {
          status: "INVITING",
          metadata: {} satisfies BattleMetadata,
          battleParticipants: {
            create: [
              {
                metadata: {} satisfies BattleParticipationMetadata,
                playerId: ctx.player.id,
              },
              {
                metadata: {} satisfies BattleParticipationMetadata,
                playerId: input.otherPlayerId,
              },
            ],
          },
        },
        select: {
          id: true,
        },
      })

      return battle
    }),
})

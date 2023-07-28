import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter } from "~/server/api/trpc"
import { type BattleMetadata } from "~/server/schema/BattleMetadata"
import { type BattleParticipationMetadata } from "~/server/schema/BattleParticipationMetadata"
import { type PlayerMetadata } from "~/server/schema/PlayerMetadata"
import { playerProcedure } from "../middleware/playerProcedure"

export const dungeonRouter = createTRPCRouter({
  startDungeon: playerProcedure
    .input(
      z.object({
        placeId: z.string(),
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
            ],
          },
          placeId: input.placeId,
          tier: 1,
        },
        select: {
          id: true,
        },
      })

      await ctx.prisma.player.update({
        where: {
          id: ctx.player.id,
        },
        data: {
          lat: ctx.player.lat,
          lng: ctx.player.lng,
          metadata: {
            ...ctx.player.metadata,
            activeBattleId: battle.id,
            navigation: null,
          } satisfies PlayerMetadata,
        },
      })

      return battle
    }),
})

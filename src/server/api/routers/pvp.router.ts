import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter } from "~/server/api/trpc"
import { type BattleMetadata } from "~/server/schema/BattleMetadata"
import { type BattleParticipationMetadata } from "~/server/schema/BattleParticipationMetadata"
import { PlayerMetadata } from "~/server/schema/PlayerMetadata"
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

  acceptInvite: playerProcedure
    .input(
      z.object({
        battleId: z.string(),
        isReady: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const battle = await ctx.prisma.battle.findFirst({
        where: {
          id: input.battleId,
          status: "INVITING",
          battleParticipants: {
            some: {
              playerId: ctx.player.id,
            },
          },
        },
        select: {
          id: true,
          battleParticipants: {
            select: {
              id: true,
              player: {
                select: {
                  id: true,
                  metadata: true,
                },
              },
            },
          },
        },
      })

      if (!battle) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Battle not found",
        })
      }

      if (input.isReady && ctx.player.metadata?.activeBattleId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already in a battle",
        })
      }

      await ctx.prisma.player.update({
        where: {
          id: ctx.player.id,
        },
        data: {
          metadata: {
            ...ctx.player.metadata,
            activeBattleId: input.isReady ? battle.id : null,
          },
        },
      })

      if (!input.isReady) {
        return false
      }

      const otherPlayer = battle.battleParticipants
        .flatMap((bp) => (bp.player ? [bp.player] : []))
        .filter((p) => !!p && p.id !== ctx.player.id)

      const allReady = otherPlayer.every(
        (p) => p.metadata?.activeBattleId === battle.id
      )

      if (!allReady) {
        return false
      }

      await ctx.prisma.battle.update({
        where: {
          id: battle.id,
        },
        data: {
          status: "IN_PROGRESS",
        },
      })

      return true
    }),

  cancelInvite: playerProcedure
    .input(
      z.object({
        battleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const battle = await ctx.prisma.battle.findFirst({
        where: {
          id: input.battleId,
          status: "INVITING",
          battleParticipants: {
            some: {
              playerId: ctx.player.id,
            },
          },
        },
        select: {
          id: true,
          battleParticipants: {
            select: {
              id: true,
              player: {
                select: {
                  id: true,
                  metadata: true,
                },
              },
            },
          },
        },
      })

      if (!battle) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Battle not found",
        })
      }

      await ctx.prisma.battle.update({
        where: {
          id: battle.id,
        },
        data: {
          status: "CANCELLED",
        },
      })

      await Promise.all(
        battle.battleParticipants.map(async (bp) => {
          if (!bp.player) return
          const metadata = PlayerMetadata.parse(bp.player.metadata)
          if (metadata?.activeBattleId === input.battleId) {
            await ctx.prisma.player.update({
              where: {
                id: bp.player.id,
              },
              data: {
                metadata: {
                  ...metadata,
                  activeBattleId: null,
                },
              },
            })
          }
        })
      )
    }),

  getStatus: playerProcedure
    .input(
      z.object({
        battleId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const battle = await ctx.prisma.battle.findFirst({
        where: {
          id: input.battleId,
          // battleParticipants: {
          //   some: {
          //     playerId: ctx.player.id,
          //   },
          // },
        },
        select: {
          id: true,
          status: true,
          battleParticipants: {
            select: {
              id: true,
              player: {
                select: {
                  id: true,
                  name: true,
                  metadata: true,
                },
              },
            },
          },
        },
      })
      if (!battle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Battle not found",
        })
      }

      const players = battle.battleParticipants
        .flatMap((bp) => (bp.player ? [bp.player] : []))
        .map((p) => ({ ...p, metadata: PlayerMetadata.parse(p.metadata) }))
        .map((p) => ({
          ...p,
          isReady: p.metadata?.activeBattleId === battle.id,
        }))

      const allReady = players.every((p) => p.isReady)

      return {
        id: battle.id,
        status: battle.status,
        players,
        allReady,
        isPvp: players.length > 1,
      }
    }),
})

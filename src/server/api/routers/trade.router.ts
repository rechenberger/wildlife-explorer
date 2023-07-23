import { TRPCError } from "@trpc/server"
import { every, some } from "lodash-es"
import { z } from "zod"
import { createTRPCRouter } from "~/server/api/trpc"
import { TradeMetadata } from "~/server/schema/TradeMetadata"
import { playerProcedure } from "../middleware/playerProcedure"

export const tradeRouter = createTRPCRouter({
  startTrade: playerProcedure
    .input(
      z.object({
        otherPlayerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.trade.create({
        data: {
          status: "PENDING",
          players: {
            connect: [{ id: ctx.player.id }, { id: input.otherPlayerId }],
          },
          metadata: { playerAccept: {} } satisfies TradeMetadata,
        },
      })
    }),

  updateTrade: playerProcedure
    .input(
      z.union([
        z.object({
          tradeId: z.string(),
          addCatchId: z.string().optional(),
          removeCatchId: z.string().optional(),
        }),
        z.object({
          tradeId: z.string(),
          status: z.enum(["accept", "reject", "cancel"]),
        }),
      ])
    )
    .mutation(async ({ ctx, input }) => {
      const trade = await ctx.prisma.trade.findUniqueOrThrow({
        where: { id: input.tradeId },
        include: { catches: true, players: true },
      })
      if (!some(trade.players, { id: ctx.player.id })) {
        throw new Error("You are not part of this trade")
      }
      if (trade.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Trade is ${trade.status}`,
        })
      }
      if ("status" in input) {
        if (input.status === "cancel") {
          await ctx.prisma.trade.update({
            where: { id: input.tradeId },
            data: { status: "CANCELLED" },
          })
        } else {
          const playerAccept = trade.metadata.playerAccept || {}
          playerAccept[ctx.player.id] = input.status === "accept" ? true : false
          const allAccepted = every(
            trade.players,
            (player) => !!playerAccept[player.id]
          )
          if (allAccepted) {
            // Transaction to make sure all catches are still owned by the player
            await ctx.prisma.$transaction(async (prisma) => {
              for (const c of trade.catches) {
                const otherPlayer = trade.players.find(
                  (p) => p.id !== ctx.player.id
                )
                if (!otherPlayer)
                  throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Could not find other player`,
                  })

                // Make sure the catch is still owned by the player
                await prisma.catch.findFirstOrThrow({
                  where: { id: c.id, playerId: ctx.player.id },
                })

                await prisma.catch.update({
                  where: { id: c.id },
                  data: { playerId: otherPlayer.id },
                })
              }

              await prisma.trade.update({
                where: { id: input.tradeId },
                data: { status: "COMPLETED", completedAt: new Date() },
              })
            })
          }
        }
      }

      // add/remove catches
      if ("addCatchId" in input) {
        await ctx.prisma.trade.update({
          where: { id: input.tradeId },
          data: {
            catches: { connect: { id: input.addCatchId } },
            metadata: { playerAccept: {} },
          },
        })
      }
      if ("removeCatchId" in input) {
        await ctx.prisma.trade.update({
          where: { id: input.tradeId },
          data: {
            catches: { disconnect: { id: input.removeCatchId } },
            metadata: { playerAccept: {} },
          },
        })
      }
    }),
})

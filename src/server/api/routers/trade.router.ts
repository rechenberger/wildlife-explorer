import { TRPCError } from "@trpc/server"
import { every, pick, some } from "lodash-es"
import { z } from "zod"
import { createTRPCRouter } from "~/server/api/trpc"
import { getWildlifeFighterPlus } from "~/server/lib/battle/getWildlifeFighterPlus"
import { type TradeMetadata } from "~/server/schema/TradeMetadata"
import { playerProcedure } from "../middleware/playerProcedure"

export const tradeRouter = createTRPCRouter({
  getLatestPending: playerProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.trade.findFirst({
      where: {
        players: {
          some: { id: ctx.player.id },
        },
        status: "PENDING",
      },
      orderBy: {
        id: "desc",
      },
    })
  }),

  getById: playerProcedure
    .input(z.object({ tradeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const tradeRaw = await ctx.prisma.trade.findUniqueOrThrow({
        where: { id: input.tradeId },
        include: {
          players: true,
          catches: {
            include: {
              wildlife: {
                include: {
                  taxon: true,
                },
              },
            },
          },
        },
      })

      const sides = await Promise.all(
        tradeRaw.players.map(async (p) => ({
          player: p,
          accepted: tradeRaw.metadata.playerAccept?.[p.id] ?? false,
          catches: await Promise.all(
            tradeRaw.catches
              .filter((c) => c.playerId === p.id)
              .map(async (c) => {
                return {
                  ...c,
                  fighter: await getWildlifeFighterPlus(c),
                }
              })
          ),
        }))
      )

      const trade = {
        ...pick(tradeRaw, ["id", "status", "createdAt", "completedAt"]),
        sides,
      }

      return trade
    }),

  startTrade: playerProcedure
    .input(
      z.object({
        otherPlayerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: check if you or the other player is in a battle or already has a pending trade
      const trade = await ctx.prisma.trade.create({
        data: {
          status: "PENDING",
          players: {
            connect: [{ id: ctx.player.id }, { id: input.otherPlayerId }],
          },
          metadata: { playerAccept: {} } satisfies TradeMetadata,
        },
        select: {
          id: true,
        },
      })

      return trade
    }),

  updateTrade: playerProcedure
    .input(
      z.union([
        z.object({
          tradeId: z.string(),
          status: z.enum(["accept", "reject", "cancel"]),
        }),
        z.object({
          tradeId: z.string(),
          addCatchId: z.string().optional(),
          removeCatchId: z.string().optional(),
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

      // When in battle can only cancel
      if (!("status" in input && input.status === "cancel")) {
        if (some(trade.players, (p) => p.metadata?.activeBattleId)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `You can not trade while one of the players is in a battle`,
          })
        }
      }

      if (trade.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Trade is ${trade.status}`,
        })
      }
      if ("status" in input) {
        console.log("status", input.status)
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
                  data: { playerId: otherPlayer.id, battleOrderPosition: null },
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

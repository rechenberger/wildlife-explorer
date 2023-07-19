import { TRPCError } from "@trpc/server"
import { filter } from "lodash-es"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import { type PlayerMetadata } from "~/server/schema/PlayerMetadata"
import { parsePlayer } from "~/server/schema/parsePlayer"
import { playerProcedure } from "../middleware/playerProcedure"

export const playerRouter = createTRPCRouter({
  getMyPlayers: protectedProcedure.query(async ({ ctx }) => {
    const playersRaw = await ctx.prisma.player.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    })
    const players = playersRaw.map(parsePlayer)
    return players
  }),

  getMe: protectedProcedure
    .input(
      z.object({
        playerId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const playerRaw = await ctx.prisma.player.findFirst({
        where: {
          userId: ctx.session.user.id,
          id: input.playerId,
        },
      })
      if (!playerRaw) {
        throw new TRPCError({
          code: "NOT_FOUND",
        })
      }
      return parsePlayer(playerRaw)
    }),
  createMe: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        lat: z.number(),
        lng: z.number(),
        hardcore: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const player = await ctx.prisma.player.create({
        data: {
          name: input.name,
          lat: input.lat,
          lng: input.lng,
          userId: ctx.session.user.id,
          metadata: {
            hardcore: input.hardcore,
          } satisfies PlayerMetadata,
        },
      })
      return player
    }),

  move: playerProcedure
    .input(z.object({ lat: z.number(), lng: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.player.update({
        where: {
          id: ctx.player.id,
        },
        data: {
          lat: input.lat,
          lng: input.lng,
          metadata: {
            ...ctx.player.metadata,
            navigation: null,
          } satisfies PlayerMetadata,
        },
      })
    }),

  others: playerProcedure.query(async ({ ctx }) => {
    const playerRaw = await ctx.prisma.player.findMany({})
    const players = playerRaw.map(parsePlayer)
    return filter(players, (player) => player.id !== ctx.player.id)
  }),
})

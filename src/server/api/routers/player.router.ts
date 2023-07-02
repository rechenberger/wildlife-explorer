import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"

import { TRPCError } from "@trpc/server"
import { filter } from "lodash-es"
import { z } from "zod"
import { playerProcedure } from "../middleware/playerProcedure"

export const playerRouter = createTRPCRouter({
  getMe: protectedProcedure
    .input(
      z.object({
        playerId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const player = await ctx.prisma.player.findFirst({
        where: {
          userId: ctx.session.user.id,
          id: input.playerId,
        },
      })
      if (!player) {
        throw new TRPCError({
          code: "NOT_FOUND",
        })
      }
      return player
    }),
  createMe: protectedProcedure
    .input(z.object({ name: z.string(), lat: z.number(), lng: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const player = await ctx.prisma.player.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
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
        },
      })
    }),

  others: playerProcedure.query(async ({ ctx }) => {
    const players = await ctx.prisma.player.findMany({})
    return filter(players, (player) => player.id !== ctx.player.id)
  }),
})

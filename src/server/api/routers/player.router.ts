import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"

import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { playerProcedure } from "../middleware/playerProcedure"

export const playerRouter = createTRPCRouter({
  getMe: protectedProcedure.query(async ({ ctx }) => {
    const player = await ctx.prisma.player.findFirst({
      where: {
        userId: ctx.session.user.id,
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
})

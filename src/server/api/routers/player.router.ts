import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"

import { TRPCError } from "@trpc/server"
import { z } from "zod"

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
    .query(async ({ ctx, input }) => {
      const player = await ctx.prisma.player.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      })
      return player
    }),
})

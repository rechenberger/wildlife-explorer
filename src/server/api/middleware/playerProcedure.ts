import { z } from "zod"
import { protectedProcedure } from "../trpc"

export const playerProcedure = protectedProcedure
  .input(z.object({ playerId: z.string().min(1) }))
  .use(async ({ ctx, next, input }) => {
    const player = await ctx.prisma.player.findFirstOrThrow({
      where: {
        id: input.playerId,
        userId: ctx.session.user.id,
      },
    })

    return next({
      ctx: {
        ...ctx,
        player,
      },
    })
  })

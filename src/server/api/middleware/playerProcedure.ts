import { z } from "zod"
import { parsePlayer } from "~/server/schema/parsePlayer"
import { protectedProcedure } from "../trpc"

export const playerProcedure = protectedProcedure
  .input(z.object({ playerId: z.string().min(1) }))
  .use(async ({ ctx, next, input }) => {
    const playerRaw = await ctx.prisma.player.findFirstOrThrow({
      where: {
        id: input.playerId,
        userId: ctx.session.user.id,
      },
    })
    const player = parsePlayer(playerRaw)

    return next({
      ctx: {
        ...ctx,
        player,
      },
    })
  })

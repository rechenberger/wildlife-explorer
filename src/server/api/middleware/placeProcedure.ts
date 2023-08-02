import { z } from "zod"
import { calcDistanceInMeter } from "~/server/lib/latLng"
import { playerProcedure } from "./playerProcedure"

export const placeProcedure = playerProcedure
  .input(
    z.object({
      placeId: z.string(),
    })
  )
  .use(async ({ ctx, next, input }) => {
    const placeRaw = await ctx.prisma.place.findUniqueOrThrow({
      where: {
        id: input.placeId,
      },
    })
    const distanceInMeter = calcDistanceInMeter(placeRaw, ctx.player)
    const place = {
      ...placeRaw,
      distanceInMeter,
    }

    return next({
      ctx: {
        ...ctx,
        place,
      },
    })
  })

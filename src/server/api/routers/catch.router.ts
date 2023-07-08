import { TRPCError } from "@trpc/server"
import { addMinutes } from "date-fns"
import {
  DEFAULT_CATCH_SUCCESS_RATE,
  DEFAULT_RESPAWN_TIME_IN_MINUTES,
} from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
import { createSeed } from "~/utils/seed"
import { playerProcedure } from "../middleware/playerProcedure"
import { wildlifeProcedure } from "../middleware/wildlifeProcedure"

export const catchRouter = createTRPCRouter({
  getMyCatches: playerProcedure.query(async ({ ctx }) => {
    const catchesRaw = await ctx.prisma.catch.findMany({
      where: {
        playerId: ctx.player.id,
      },
      include: {
        wildlife: true,
      },
    })
    const catches = catchesRaw.map((c) => ({
      ...c,
      wildlife: {
        ...c.wildlife,
        metadata: WildlifeMetadata.parse(c.wildlife.metadata),
      },
    }))
    return catches
  }),

  catch: wildlifeProcedure.mutation(async ({ ctx }) => {
    const luck = Math.random()
    const isLucky = luck > DEFAULT_CATCH_SUCCESS_RATE

    const respawnsAt = addMinutes(new Date(), DEFAULT_RESPAWN_TIME_IN_MINUTES)
    await ctx.prisma.wildlife.update({
      where: {
        id: ctx.wildlife.id,
      },
      data: {
        respawnsAt,
      },
    })

    if (!isLucky) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Wildlife escaped 💨",
      })
    }

    await ctx.prisma.catch.create({
      data: {
        playerId: ctx.player.id,
        wildlifeId: ctx.wildlife.id,
        seed: createSeed(ctx.wildlife),
      },
    })

    return {
      success: true,
    }
  }),
})

import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { DEFAULT_CATCH_SUCCESS_RATE } from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { respawnWildlife } from "~/server/lib/respawnWildlife"
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
      orderBy: [
        {
          battleOrderPosition: {
            sort: "desc",
            nulls: "last",
          },
        },
        {
          createdAt: "asc",
        },
      ],
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

  setBattleOrderPosition: playerProcedure
    .input(
      z.object({
        catchId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const maxBattleOrderPositionData = await ctx.prisma.catch.aggregate({
        where: {
          playerId: ctx.player.id,
        },
        _max: {
          battleOrderPosition: true,
        },
      })

      const maxBattleOrderPosition =
        maxBattleOrderPositionData._max.battleOrderPosition || 0

      await ctx.prisma.catch.updateMany({
        where: {
          playerId: ctx.player.id,
          id: input.catchId,
        },
        data: {
          battleOrderPosition: maxBattleOrderPosition + 1,
        },
      })
    }),

  catch: wildlifeProcedure.mutation(async ({ ctx }) => {
    if (
      ctx.wildlifeBattleId &&
      ctx.wildlifeBattleId !== ctx.player.metadata?.activeBattleId
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Wildlife is in a battle with another player",
      })
    }

    const luck = Math.random()
    const isLucky = luck > DEFAULT_CATCH_SUCCESS_RATE

    await respawnWildlife({
      prisma: ctx.prisma,
      wildlifeId: ctx.wildlife.id,
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

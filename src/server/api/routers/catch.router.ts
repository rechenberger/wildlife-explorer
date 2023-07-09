import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { CATCH_RATE_ALWAYS_LOOSE, CATCH_RATE_ALWAYS_WIN } from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { simulateBattle } from "~/server/lib/battle/simulateBattle"
import { respawnWildlife } from "~/server/lib/respawnWildlife"
import { PlayerMetadata } from "~/server/schema/PlayerMetadata"
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
    if (ctx.wildlife.metadata.observationCaptive) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Wildlife is captive and cannot be caught 🚫",
      })
    }
    if (
      ctx.wildlifeBattleId &&
      ctx.wildlifeBattleId !== ctx.player.metadata?.activeBattleId
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Wildlife is in a battle with another player",
      })
    }

    const battleId = ctx.wildlifeBattleId
    const battle = battleId
      ? await simulateBattle({
          prisma: ctx.prisma,
          battleId,
        })
      : null

    const status = battle?.battleStatus.sides
      .flatMap((s) => s.fighters)
      ?.find(
        (f) => !f.catch && f.wildlife.id === ctx.wildlife.id
      )?.fighterStatus
    const hpPercent = status ? status.hp / status.hpMax : 1

    const goal =
      CATCH_RATE_ALWAYS_LOOSE +
      hpPercent * (1 - CATCH_RATE_ALWAYS_WIN - CATCH_RATE_ALWAYS_LOOSE)
    const luck = Math.random()
    const isLucky = luck > goal

    // Currently, we respawn wildlife even if the player is not lucky
    // Also the battle always ends after the catch

    await respawnWildlife({
      prisma: ctx.prisma,
      wildlifeId: ctx.wildlife.id,
    })

    if (battle) {
      await ctx.prisma.battle.update({
        where: {
          id: battleId,
        },
        data: {
          status: "CANCELLED",
        },
      })
      await ctx.prisma.player.update({
        where: {
          id: ctx.player.id,
        },
        data: {
          metadata: {
            ...ctx.player.metadata,
            activeBattleId: null,
          } satisfies PlayerMetadata,
        },
      })
    }

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

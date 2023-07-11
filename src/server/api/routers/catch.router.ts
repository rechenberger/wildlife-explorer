import { TRPCError } from "@trpc/server"
import { map, take } from "lodash-es"
import { z } from "zod"
import {
  CATCH_RATE_ALWAYS_LOOSE,
  CATCH_RATE_ALWAYS_WIN,
  CATCH_RATE_FIRST_FIGHTER,
  MAX_FIGHTERS_PER_TEAM,
} from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { getWildlifeFighterPlus } from "~/server/lib/battle/getWildlifeFighterPlus"
import { simulateBattle } from "~/server/lib/battle/simulateBattle"
import { respawnWildlife } from "~/server/lib/respawnWildlife"
import { type PlayerMetadata } from "~/server/schema/PlayerMetadata"
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
            sort: "asc",
            nulls: "last",
          },
        },
        {
          createdAt: "desc",
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

    const catchesWithFighter = await Promise.all(
      catches.map(async (c) => {
        const fighter = await getWildlifeFighterPlus({
          wildlife: c.wildlife,
          seed: c.seed,
        })
        return {
          ...c,
          fighter,
        }
      })
    )

    return catchesWithFighter
  }),

  setBattleOrderPosition: playerProcedure
    .input(
      z.object({
        catchId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.player.metadata?.activeBattleId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change battle order while in a battle",
        })
      }

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

  setMyTeamBattleOrder: playerProcedure
    .input(z.object({ catchIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.player.metadata?.activeBattleId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change battle order while in a battle",
        })
      }

      const catchIdsMaxPerTeam = take(input.catchIds, MAX_FIGHTERS_PER_TEAM)

      await ctx.prisma.catch.updateMany({
        where: {
          playerId: ctx.player.id,
        },
        data: {
          battleOrderPosition: null,
        },
      })

      map(catchIdsMaxPerTeam, async (catchId, index) => {
        await ctx.prisma.catch.updateMany({
          where: {
            playerId: ctx.player.id,
            id: catchId,
          },
          data: {
            battleOrderPosition: index + 1,
          },
        })
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

    const someCatch = await ctx.prisma.catch.findFirst({
      where: {
        playerId: ctx.player.id,
      },
    })

    const battleId = ctx.wildlifeBattleId
    const battle = battleId
      ? await simulateBattle({
          prisma: ctx.prisma,
          battleId,
        })
      : null

    let goal: number
    if (someCatch) {
      const status = battle?.battleStatus.sides
        .flatMap((s) => s.fighters)
        ?.find((f) => !f.catch && f.wildlife.id === ctx.wildlife.id)?.fighter
      const hpPercent = status ? status.hp / status.hpMax : 1

      goal =
        CATCH_RATE_ALWAYS_LOOSE +
        hpPercent * (1 - CATCH_RATE_ALWAYS_WIN - CATCH_RATE_ALWAYS_LOOSE)
    } else {
      // FIRST CATCH: special case
      goal = 1 - CATCH_RATE_FIRST_FIGHTER
    }
    const luck = Math.random()
    const isLucky = luck >= goal

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
    const battleOrderCount = await ctx.prisma.catch.count({
      where: {
        playerId: ctx.player.id,
        battleOrderPosition: {
          not: null,
        },
      },
    })
    await ctx.prisma.catch.create({
      data: {
        playerId: ctx.player.id,
        wildlifeId: ctx.wildlife.id,
        seed: createSeed(ctx.wildlife),
        battleOrderPosition:
          battleOrderCount < MAX_FIGHTERS_PER_TEAM
            ? battleOrderCount + 1
            : null,
      },
    })

    return {
      success: true,
    }
  }),

  rename: playerProcedure
    .input(
      z.object({
        catchId: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.catch.updateMany({
        where: {
          playerId: ctx.player.id,
          id: input.catchId,
        },
        data: {
          name: input.name,
        },
      })
    }),
})

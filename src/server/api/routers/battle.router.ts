import { TRPCError } from "@trpc/server"
import { map } from "lodash-es"
import { z } from "zod"
import { createTRPCRouter } from "~/server/api/trpc"
import { simulateBattle } from "~/server/lib/battle/simulateBattle"
import { BattleMetadata } from "~/server/schema/BattleMetadata"
import { BattleParticipationMetadata } from "~/server/schema/BattleParticipationMetadata"
import { type PlayerMetadata } from "~/server/schema/PlayerMetadata"
import { devProcedure } from "../middleware/devProcedure"
import { playerProcedure } from "../middleware/playerProcedure"
import { wildlifeProcedure } from "../middleware/wildlifeProcedure"

export const battleRouter = createTRPCRouter({
  attackWildlife: wildlifeProcedure.mutation(async ({ ctx }) => {
    const playerInFight = await ctx.prisma.battleParticipation.findFirst({
      where: {
        playerId: ctx.player.id,
        battle: {
          status: "IN_PROGRESS",
        },
      },
    })
    if (playerInFight || ctx.player.metadata?.activeBattleId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You are already in a fight",
      })
    }

    const wildlifeInFight = await ctx.prisma.battleParticipation.findFirst({
      where: {
        wildlifeId: ctx.wildlife.id,
        battle: {
          status: "IN_PROGRESS",
        },
      },
    })
    if (wildlifeInFight) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Wildlife is already in a fight",
      })
    }

    const battle = await ctx.prisma.battle.create({
      data: {
        status: "IN_PROGRESS",
        metadata: {},
        battleParticipants: {
          createMany: {
            data: [
              {
                playerId: ctx.player.id,
                metadata: {},
              },
              {
                wildlifeId: ctx.wildlife.id,
                metadata: {},
              },
            ],
          },
        },
      },
    })

    await ctx.prisma.player.update({
      where: {
        id: ctx.player.id,
      },
      data: {
        lat: ctx.player.lat,
        lng: ctx.player.lng,
        metadata: {
          ...ctx.player.metadata,
          activeBattleId: battle.id,
          navigation: null,
        } satisfies PlayerMetadata,
      },
    })

    return battle
  }),

  getMyBattles: playerProcedure.query(async ({ ctx }) => {
    const battlesRaw = await ctx.prisma.battle.findMany({
      where: {
        battleParticipants: {
          some: {
            playerId: ctx.player.id,
          },
        },
      },
      include: {
        battleParticipants: true,
      },
    })
    const battles = map(battlesRaw, (battle) => ({
      ...battle,
      metadata: BattleMetadata.parse(battle.metadata),
      battleParticipants: map(
        battle.battleParticipants,
        (battleParticipant) => ({
          ...battleParticipant,
          metadata: BattleParticipationMetadata.parse(
            battleParticipant.metadata
          ),
        })
      ),
    }))
    return battles
  }),

  getBattleStatus: playerProcedure
    .input(
      z.object({
        battleId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { battleStatus } = await simulateBattle({
        prisma: ctx.prisma,
        battleId: input.battleId,
      })
      return battleStatus
    }),

  reset: devProcedure
    .input(z.object({ battleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.battle.update({
        where: {
          id: input.battleId,
        },
        data: {
          status: "IN_PROGRESS",
          metadata: {},
        },
      })
    }),

  makeChoice: playerProcedure
    .input(
      z.object({
        battleId: z.string(),
        // moveNo: z.number().min(1).max(MAX_MOVES_PER_FIGHTER),
        choice: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // let inputLog = battle.metadata.inputLog ?? []
      // inputLog = [...inputLog, `>${participantId} ${input.choice}`]

      const { battleJson, battleDb } = await simulateBattle({
        prisma: ctx.prisma,
        battleId: input.battleId,
        choice: {
          playerId: ctx.player.id,
          choice: input.choice,
        },
      })
      console.time("update")
      await ctx.prisma.battle.update({
        where: {
          id: input.battleId,
        },
        data: {
          metadata: {
            ...battleDb.metadata,
            battleJson,
          } satisfies BattleMetadata,
        },
      })
      console.timeEnd("update")
    }),

  run: playerProcedure
    .input(
      z.object({
        battleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: chance?
      // TODO: SECURITY: check if player is in battle
      await ctx.prisma.battle.update({
        where: {
          id: input.battleId,
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
    }),
})

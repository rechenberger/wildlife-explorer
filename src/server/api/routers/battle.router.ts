import { TRPCError } from "@trpc/server"
import { find, map } from "lodash-es"
import { z } from "zod"
import { createTRPCRouter } from "~/server/api/trpc"
import { simulateBattle } from "~/server/lib/battle/simulateBattle"
import { respawnWildlife } from "~/server/lib/respawnWildlife"
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
      const { battleStatus, battleDb } = await simulateBattle({
        prisma: ctx.prisma,
        battleId: input.battleId,
      })
      return {
        battleStatus,
        status: battleDb.status,
      }
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

      const { battleJson, battleDb, battleStatus } = await simulateBattle({
        prisma: ctx.prisma,
        battleId: input.battleId,
        choice: {
          playerId: ctx.player.id,
          choice: input.choice,
        },
      })
      console.time("update")
      const winner = battleStatus.winner
      console.log("winner", winner)
      await ctx.prisma.battle.update({
        where: {
          id: input.battleId,
        },
        data: {
          status: winner ? "FINISHED" : "IN_PROGRESS",
          metadata: {
            ...battleDb.metadata,
            battleJson,
          } satisfies BattleMetadata,
        },
      })

      // END OF BATTLE
      if (!!winner) {
        const participants = battleDb.battleParticipants
        const winnerParticipantId = find(
          participants,
          (p) =>
            p.player?.name === winner ||
            (!!p.wildlifeId && winner == "Wildlife")
        )?.id
        await Promise.all(
          map(battleDb.battleParticipants, async (p) => {
            const isWinner = p.id === winnerParticipantId
            await ctx.prisma.battleParticipation.update({
              where: {
                id: p.id,
              },
              data: {
                isWinner,
                player: p.player
                  ? {
                      update: {
                        metadata: {
                          ...p.player?.metadata,
                          activeBattleId: null,
                        },
                      },
                    }
                  : undefined,
              },
            })
            if (p.wildlifeId) {
              await respawnWildlife({
                prisma: ctx.prisma,
                wildlifeId: p.wildlifeId,
              })
            }
          })
        )
      }
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
      const battle = await ctx.prisma.battle.update({
        where: {
          id: input.battleId,
        },
        data: {
          status: "CANCELLED",
        },
        include: {
          battleParticipants: true,
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

      await Promise.all(
        map(battle.battleParticipants, async (p) => {
          if (p.wildlifeId) {
            await respawnWildlife({
              prisma: ctx.prisma,
              wildlifeId: p.wildlifeId,
            })
          }
        })
      )
    }),
})

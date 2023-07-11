import { TRPCError } from "@trpc/server"
import { find, map } from "lodash-es"
import { z } from "zod"
import { createTRPCRouter } from "~/server/api/trpc"
import { simulateBattle } from "~/server/lib/battle/simulateBattle"
import { respawnWildlife } from "~/server/lib/respawnWildlife"
import { BattleMetadata } from "~/server/schema/BattleMetadata"
import { BattleParticipationMetadata } from "~/server/schema/BattleParticipationMetadata"
import { PlayerMetadata } from "~/server/schema/PlayerMetadata"
import { WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
import { devProcedure } from "../middleware/devProcedure"
import { playerProcedure } from "../middleware/playerProcedure"
import { wildlifeProcedure } from "../middleware/wildlifeProcedure"

export const battleRouter = createTRPCRouter({
  attackWildlife: wildlifeProcedure.mutation(async ({ ctx }) => {
    if (ctx.wildlifeBattleId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Wildlife is already in a battle",
      })
    }

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
        message: "You are already in a battle",
      })
    }

    const caughtWildlife = await ctx.prisma.catch.findFirst({
      where: {
        playerId: ctx.player.id,
        battleOrderPosition: {
          not: null,
        },
      },
    })
    if (!caughtWildlife) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You need to catch at least one wildlife to battle 😉",
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
        battleParticipants: {
          include: {
            player: true,
            wildlife: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
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
          player: battleParticipant.player
            ? {
                ...battleParticipant.player,
                metadata: PlayerMetadata.parse(
                  battleParticipant.player.metadata
                ),
              }
            : null,
          wildlife: battleParticipant.wildlife
            ? {
                ...battleParticipant.wildlife,
                metadata: WildlifeMetadata.parse(
                  battleParticipant.wildlife.metadata
                ),
              }
            : null,
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
      const { battleStatus, battleDb, playerChoices } = await simulateBattle({
        prisma: ctx.prisma,
        battleId: input.battleId,
      })
      return {
        battleStatus,
        status: battleDb.status,
        playerChoices,
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
          battleParticipants: {
            include: {
              player: true,
            },
          },
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

          if (p.player) {
            await ctx.prisma.player.update({
              where: {
                id: ctx.player.id,
              },
              data: {
                metadata: {
                  ...PlayerMetadata.parse(p.player.metadata),
                  activeBattleId: null,
                } satisfies PlayerMetadata,
              },
            })
          }
        })
      )
    }),
})

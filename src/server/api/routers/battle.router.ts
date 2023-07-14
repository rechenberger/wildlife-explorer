import { BattleStatus } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import { every, find, map } from "lodash-es"
import { z } from "zod"
import { BATTLE_REPORT_VERSION } from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { grantExp } from "~/server/lib/battle/grantExp"
import { simulateBattle } from "~/server/lib/battle/simulateBattle"
import { respawnWildlife } from "~/server/lib/respawnWildlife"
import { type BattleMetadata } from "~/server/schema/BattleMetadata"
import { type PlayerMetadata } from "~/server/schema/PlayerMetadata"
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

  getMyLatestParticipation: playerProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.battleParticipation.findFirst({
      where: {
        playerId: ctx.player.id,
      },
      select: {
        battle: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    })
  }),

  getMyBattles: playerProcedure.query(async ({ ctx }) => {
    const battles = await ctx.prisma.battle.findMany({
      where: {
        battleParticipants: {
          some: {
            playerId: ctx.player.id,
          },
        },
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
        battleParticipants: {
          select: {
            id: true,
            isWinner: true,
            player: {
              select: {
                id: true,
                name: true,
              },
            },
            wildlife: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    })
    return battles
  }),

  getBattleStatus: playerProcedure
    .input(
      z.object({
        battleId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      console.time("getBattleFast")
      const battle = await ctx.prisma.battle.findUnique({
        where: {
          id: input.battleId,
        },
        select: {
          id: true,
          status: true,
          metadata: true,
        },
      })
      console.timeEnd("getBattleFast")
      if (!battle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Battle not found",
        })
      }
      const alwaysAllowedBattleStatus: BattleStatus[] = [
        BattleStatus.IN_PROGRESS,
        BattleStatus.INVITING,
      ]
      if (
        !alwaysAllowedBattleStatus.includes(battle.status) &&
        battle.metadata.battleReport?.version !== BATTLE_REPORT_VERSION
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Battle report is outdated and cannot be viewed anymore",
        })
      }

      if (battle?.metadata.battleReport) {
        const battleReport = battle.metadata.battleReport
        if (battleReport.version === BATTLE_REPORT_VERSION) {
          return {
            status: battle.status,
            battleReport,
          }
        }
      }

      const { battleReport } = await simulateBattle({
        prisma: ctx.prisma,
        battleId: input.battleId,
      })
      return {
        battleReport,
        status: battle.status,
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
        choice: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const battleBefore = await ctx.prisma.battle.findUnique({
        where: {
          id: input.battleId,
        },
      })
      if (!battleBefore) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Battle not found",
        })
      }
      if (battleBefore.status !== "IN_PROGRESS") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Battle not active",
        })
      }

      const { battleJson, battleReport, battleInput } = await simulateBattle({
        prisma: ctx.prisma,
        battleId: input.battleId,
        choice: {
          playerId: ctx.player.id,
          choice: input.choice,
        },
        battleInput: battleBefore?.metadata?.battleInput,
        battleJson: battleBefore?.metadata?.battleJson,
      })
      console.time("update")

      const winnerSide = find(battleReport.sides, (side) => side.isWinner)

      await ctx.prisma.battle.update({
        where: {
          id: input.battleId,
        },
        data: {
          status: !!winnerSide ? "FINISHED" : "IN_PROGRESS",
          metadata: {
            battleJson,
            battleReport: battleReport,
            battleInput: battleInput as any,
          } satisfies BattleMetadata,
        },
      })
      console.timeEnd("update")

      // END OF BATTLE
      if (!!winnerSide) {
        const battleDb = await ctx.prisma.battle.findUniqueOrThrow({
          where: {
            id: input.battleId,
          },
          include: {
            battleParticipants: {
              include: {
                player: true,
                wildlife: true,
              },
            },
          },
        })

        await Promise.all(
          map(battleDb.battleParticipants, async (p) => {
            const isWinner = p.id === winnerSide.participationId
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

            if (p.wildlife?.id) {
              await respawnWildlife({
                prisma: ctx.prisma,
                wildlifeId: p.wildlife.id,
              })
            }
          })
        )

        // GAIN EXP
        const wasPvpFight = every(
          battleDb.battleParticipants,
          (p) => !!p.player?.id
        )
        const gainExp = !wasPvpFight
        if (gainExp && winnerSide.participationId) {
          const { expReports } = await grantExp({
            prisma: ctx.prisma,
            battleReport,
            winnerParticipationId: winnerSide.participationId,
            onlyFaintedGiveExp: true,
          })
          const iAmWinner = winnerSide.player?.id === ctx.player.id
          return {
            iAmWinner,
            expReports,
            winnerName: winnerSide.name,
          }
        }
      }
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
                id: p.player.id,
              },
              data: {
                metadata: {
                  ...p.player.metadata,
                  activeBattleId: null,
                } satisfies PlayerMetadata,
              },
            })
          }
        })
      )
    }),
})

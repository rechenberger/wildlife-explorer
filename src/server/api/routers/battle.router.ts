import { TRPCError } from "@trpc/server"
import { find, map } from "lodash-es"
import { z } from "zod"
import { BATTLE_REPORT_VERSION } from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { simulateBattle } from "~/server/lib/battle/simulateBattle"
import { respawnWildlife } from "~/server/lib/respawnWildlife"
import { type BattleMetadata } from "~/server/schema/BattleMetadata"
import { type PlayerMetadata } from "~/server/schema/PlayerMetadata"
import { calcExpForDefeatedPokemon } from "~/utils/calcExpForDefeatedPokemon"
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
    const battles = await ctx.prisma.battle.findMany({
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
      if (
        battle.status !== "IN_PROGRESS" &&
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
      const winner = battleReport.winner
      // console.log("winner", winner)
      await ctx.prisma.battle.update({
        where: {
          id: input.battleId,
        },
        data: {
          status: winner ? "FINISHED" : "IN_PROGRESS",
          metadata: {
            battleJson,
            battleReport: battleReport,
            battleInput: battleInput as any,
          } satisfies BattleMetadata,
        },
      })

      // map(battleReport.sides, (side) => {
      //   // console.log("side", side)
      //   map(side.fighters, (fighter) => {
      //     console.log("fighter", pick(fighter.fighter, "species"))
      //   })
      // })

      // END OF BATTLE
      if (!!winner) {
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
        const participants = battleDb.battleParticipants

        const winnerIsWildlife = winner === "Wildlife"

        const winnerParticipantId = find(
          participants,
          (p) =>
            p.player?.name === winner || (!!p.wildlife?.id && winnerIsWildlife)
        )?.id

        if (winnerIsWildlife) return
        // player related stuff - not for wildlife

        // const wasPvpFight = every(participants, (p) => !!p.player?.id)
        // if (wasPvpFight) {
        //   //no xp for pvp so far
        //   return
        // }

        const winnerSide = find(battleReport.sides, (s) => s.isWinner)
        const looserSide = find(battleReport.sides, (s) => !s.isWinner)

        for await (const looserFighter of looserSide?.fighters || []) {
          // console.log({ looserFighter })
          if (!looserFighter.fainted) continue

          for await (const winnerFighter of winnerSide?.fighters || []) {
            if (!winnerFighter.catch?.id || winnerFighter.fainted) continue
            const winningCatch = await ctx.prisma.catch.findUniqueOrThrow({
              where: {
                id: winnerFighter.catch.id,
              },
            })
            const expRes = calcExpForDefeatedPokemon({
              defeatedFighter: {
                speciesNum: looserFighter.fighter.speciesNum,
                level: looserFighter.fighter.level,
              },
              receivingFighter: winningCatch.metadata,
              participatedInBattle: !!winnerFighter.activeTurns,
              isOriginalOwner:
                winningCatch.originalPlayerId === winnerSide?.player?.id,
            })
            // console.log({
            //   winnerFighter: winnerFighter,
            //   expRes,
            //   newXp: (winningCatch?.metadata?.exp || 0) + expRes,
            // })
            await ctx.prisma.catch.update({
              where: {
                id: winnerFighter.catch.id,
              },
              data: {
                metadata: {
                  ...winningCatch.metadata,
                  exp: (winningCatch?.metadata?.exp || 0) + expRes,
                },
              },
              select: {
                id: true,
              },
            })
          }
        }

        // const winnerParticipant = find(
        //   participants,
        //   (p) => p?.player?.name === winner
        // )
        // const defeatedWildlifeParticipant = find(
        //   participants,
        //   (p) => !!p?.wildlife?.id && p.id !== winnerParticipantId
        // )
        // const defeatedWildlife = defeatedWildlifeParticipant?.wildlife
        // if (!defeatedWildlife) return

        // const wildlifeMetadata = WildlifeMetadata.parse(
        //   defeatedWildlife.metadata
        // )

        // const wildlifeAsFighter = await getWildlifeFighterPlus({
        //   wildlife: { metadata: wildlifeMetadata },
        //   seed: createSeed(defeatedWildlife),
        // })
        // console.log({ winnerParticipant })

        // const winnerTeam = await ctx.prisma.catch.findMany({
        //   where: {
        //     battleOrderPosition: { not: null },
        //     playerId: winnerParticipant?.player?.id,
        //   },
        // })

        // map(winnerTeam, (winnerFighter) => {
        //   console.log({
        //     winnerFighter: winnerFighter.metadata.speciesName,
        //     defeatedWildlife: wildlifeAsFighter.species,
        //     xpres: calcExpForDefeatedPokemon({
        //       defeatedFighter: {
        //         speciesNum: wildlifeAsFighter.speciesNum,
        //         level: wildlifeAsFighter.level,
        //       },
        //       receivingFighter: winnerFighter.metadata,
        //       participatedInBattle: true,
        //       isOriginalOwner:
        //         winnerFighter.originalPlayerId ===
        //         winnerParticipant?.player?.id,
        //     }),
        //   })
        // })

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

            if (p.wildlife?.id) {
              await respawnWildlife({
                prisma: ctx.prisma,
                wildlifeId: p.wildlife.id,
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

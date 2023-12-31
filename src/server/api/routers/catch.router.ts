import { TRPCError } from "@trpc/server"
import { every, find, map, take } from "lodash-es"
import { z } from "zod"
import {
  CATCH_RATE_ALWAYS_LOOSE,
  CATCH_RATE_ALWAYS_WIN,
  CATCH_RATE_FIRST_FIGHTER,
  MAX_FIGHTERS_PER_TEAM,
} from "~/config"
import { getExpRate } from "~/data/pokemonLevelExperienceMap"
import { PokemonLevelingRate } from "~/data/pokemonLevelingRate"
import { createTRPCRouter } from "~/server/api/trpc"
import { getWildlifeFighterPlus } from "~/server/lib/battle/getWildlifeFighterPlus"
import { grantExp, type ExpReports } from "~/server/lib/battle/grantExp"
import { savePostBattleCatchMetadata } from "~/server/lib/battle/savePostBattleCatchMetadata"
import { respawnWildlife } from "~/server/lib/respawnWildlife"
import { LevelingRate, type CatchMetadata } from "~/server/schema/CatchMetadata"
import { type PlayerMetadata } from "~/server/schema/PlayerMetadata"
import { createSeed } from "~/utils/seed"
import {
  careCenterProcedure,
  checkForCareCenter,
} from "../middleware/careCenterProcedure"
import { playerProcedure } from "../middleware/playerProcedure"
import { wildlifeProcedure } from "../middleware/wildlifeProcedure"

export const catchRouter = createTRPCRouter({
  getMyCatches: playerProcedure.query(async ({ ctx }) => {
    const catches = await ctx.prisma.catch.findMany({
      where: {
        playerId: ctx.player.id,
      },
      include: {
        wildlife: {
          include: {
            taxon: {
              select: {
                fighterSpeciesName: true,
                // fighterSpeciesNum: true,
              },
            },
          },
        },
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

    const catchesWithFighter = await Promise.all(
      catches.map(async (c) => {
        const fighter = await getWildlifeFighterPlus(c)
        return {
          ...c,
          fighter,
        }
      })
    )

    return catchesWithFighter
  }),

  setMyTeamBattleOrder: playerProcedure
    .input(
      z.object({ catchIds: z.array(z.string()), swapWithinTeam: z.boolean() })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.player.metadata?.activeBattleId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change battle order while in a battle",
        })
      }

      if (input.swapWithinTeam) {
        const currentTeam = await ctx.prisma.catch.findMany({
          where: {
            playerId: ctx.player.id,
            battleOrderPosition: {
              not: null,
            },
          },
        })
        const allInTeam = every(input.catchIds, (id) =>
          find(currentTeam, { id })
        )
        const didNotRemove = input.catchIds.length === currentTeam.length
        if (!allInTeam || !didNotRemove) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "When swappingWithinTeam all catches must be in the team",
          })
        }
      } else {
        await checkForCareCenter({ ctx })
      }

      const catchIdsMaxPerTeam = take(input.catchIds, MAX_FIGHTERS_PER_TEAM)
      await ctx.prisma.$transaction([
        ctx.prisma.catch.updateMany({
          where: {
            playerId: ctx.player.id,
          },
          data: {
            battleOrderPosition: null,
          },
        }),
        ...map(catchIdsMaxPerTeam, (catchId, index) =>
          ctx.prisma.catch.updateMany({
            where: {
              playerId: ctx.player.id,
              id: catchId,
            },
            data: {
              battleOrderPosition: index + 1,
            },
          })
        ),
      ])
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

    // TODO: can be read from battle report in battle metadata
    const battleId = ctx.wildlifeBattleId
    const battle = battleId
      ? await ctx.prisma.battle.findFirstOrThrow({
          where: {
            id: battleId,
          },
          select: {
            metadata: true,
            battleParticipants: {
              select: {
                id: true,
                playerId: true,
              },
            },
          },
        })
      : null

    let goal: number
    if (someCatch) {
      const status = battle?.metadata.battleReport?.sides
        .flatMap((s) => s.fighters)
        ?.find((f) => !f.catch && f.wildlife?.id === ctx.wildlife.id)?.fighter
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
    // console.log("goal", goal, luck, isLucky)

    // Currently, we respawn wildlife even if the player is not lucky
    // Also the battle always ends after the catch

    await respawnWildlife({
      prisma: ctx.prisma,
      wildlifeId: ctx.wildlife.id,
      reason: isLucky ? "CATCH_SUCCESS" : "CATCH_FAIL",
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
      // Catch metadata
      if (battle?.metadata.battleReport) {
        await savePostBattleCatchMetadata({
          battleReport: battle.metadata.battleReport,
          prisma: ctx.prisma,
        })
      }

      // Failed catch
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

    const seed = createSeed(ctx.wildlife)
    const wildlifeFighterPlus = await getWildlifeFighterPlus({
      wildlife: ctx.wildlife,
      seed,
      playerId: null,
      originalPlayerId: null,
    })

    const speciesName = wildlifeFighterPlus.species
    const speciesNum = wildlifeFighterPlus.speciesNum
    const level = wildlifeFighterPlus.level
    const levelingRate = LevelingRate.parse(
      PokemonLevelingRate[speciesNum]?.levelingRate
    )
    if (!levelingRate) {
      console.error(
        `No leveling rate for Species Name:${speciesName} Num:${speciesNum}`
      )
      throw new TRPCError({
        code: "CONFLICT",
        message: "Wildlife has no leveling rate 🤔",
      })
    }
    const exp = getExpRate({
      level,
      levelingRate,
    })?.requiredExperience
    if (!level) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Wildlife has no level 🤔",
      })
    }
    if (!exp) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Wildlife has no exp 🤔",
      })
    }

    // Create new catch
    const catchMetadata = {
      speciesNum,
      level,
      exp,
      levelingRate,
      speciesName,
    } satisfies CatchMetadata
    await ctx.prisma.catch.create({
      data: {
        playerId: ctx.player.id,
        originalPlayerId: ctx.player.id,
        wildlifeId: ctx.wildlife.id,
        seed,
        battleOrderPosition:
          battleOrderCount < MAX_FIGHTERS_PER_TEAM
            ? battleOrderCount + 1
            : null,
        metadata: catchMetadata,
      },
    })

    // EXP
    let expReports: ExpReports | null = null
    if (battle && battle.metadata.battleReport) {
      const winnerParticipationId = find(
        battle.battleParticipants,
        (bp) => bp.playerId === ctx.player.id
      )?.id
      if (winnerParticipationId) {
        const result = await grantExp({
          battleReport: battle.metadata.battleReport,
          prisma: ctx.prisma,
          winnerParticipationId,
          onlyFaintedGiveExp: false,
        })
        expReports = result.expReports
      }
    }

    // Catch metadata for battle participants
    if (battle && battle.metadata.battleReport) {
      await savePostBattleCatchMetadata({
        battleReport: battle.metadata.battleReport,
        prisma: ctx.prisma,
      })
    }

    return {
      expReports,
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

  care: careCenterProcedure.mutation(async ({ ctx }) => {
    const all = await ctx.prisma.catch.findMany({
      where: {
        playerId: ctx.player.id,
      },
      include: {
        wildlife: {
          include: {
            taxon: {
              select: {
                fighterSpeciesName: true,
                // fighterSpeciesNum: true,
              },
            },
          },
        },
      },
    })
    let count = 0
    await Promise.all(
      map(all, async (c) => {
        const fighter = await getWildlifeFighterPlus(c)
        let needToSave = false

        // PP
        const moves = fighter.moves.map((m) => {
          if (!m.id) {
            throw new Error("No move id")
          }
          if (m.status?.pp !== m.definition.pp) {
            needToSave = true
          }
          return {
            id: m.id,
            pp: m.definition.pp,
          }
        })

        // HP
        if (fighter.hp !== fighter.hpMax) {
          needToSave = true
        }
        const hp = fighter.hpMax

        if (needToSave) {
          count++
          await ctx.prisma.catch.update({
            where: {
              id: c.id,
            },
            data: {
              metadata: {
                ...c.metadata,
                moves,
                hp,
              } satisfies CatchMetadata,
            },
          })
        }
      })
    )

    return { count }
  }),
})

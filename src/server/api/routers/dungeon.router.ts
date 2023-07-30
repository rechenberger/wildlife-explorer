import { TRPCError } from "@trpc/server"
import { orderBy } from "lodash-es"
import { z } from "zod"
import { RADIUS_IN_M_DUNGEON } from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { type MyPrismaClient } from "~/server/db"
import { checkIfReadyForBattle } from "~/server/lib/battle/checkIfReadyForBattle"
import { getDungeonFighter } from "~/server/lib/battle/getDungeonFighter"
import { transformPokemonSetToPlus } from "~/server/lib/battle/getWildlifeFighterPlus"
import { type BattleMetadata } from "~/server/schema/BattleMetadata"
import { type BattleParticipationMetadata } from "~/server/schema/BattleParticipationMetadata"
import { type PlayerMetadata } from "~/server/schema/PlayerMetadata"
import { placeProcedure } from "../middleware/placeProcedure"
import { playerProcedure } from "../middleware/playerProcedure"

export const dungeonRouter = createTRPCRouter({
  startDungeon: placeProcedure.mutation(async ({ ctx, input }) => {
    if (ctx.place.distanceInMeter > RADIUS_IN_M_DUNGEON) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Can only enter a dungeon when within ${RADIUS_IN_M_DUNGEON}m`,
      })
    }

    await checkIfReadyForBattle(ctx)

    const { id: battleId } = await startDungeonBattle({
      prisma: ctx.prisma,
      placeId: input.placeId,
      tier: 1,
      player: ctx.player,
    })

    return { battleId }
  }),

  getHighscore: playerProcedure
    .input(
      z.object({
        placeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const participations = await ctx.prisma.battleParticipation.findMany({
        where: {
          playerId: {
            not: null,
          },
          battle: {
            placeId: input.placeId,
          },
        },
        orderBy: [
          {
            battle: {
              tier: "desc",
            },
          },
          {
            createdAt: "asc",
          },
        ],
        distinct: ["playerId"],
        take: 10,
        select: {
          player: true,
          battle: {
            select: {
              id: true,
              tier: true,
              createdAt: true,
            },
          },
        },
      })

      const highscore = participations.map((p) => {
        if (!p.player) {
          throw new Error("Player not found")
        }
        return {
          battleId: p.battle.id,
          tier: p.battle.tier,
          player: p.player,
        }
      })

      return highscore
    }),

  getFighters: playerProcedure
    .input(
      z.object({
        placeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const battles = await ctx.prisma.battle.findMany({
        where: {
          placeId: input.placeId,
          battleParticipants: {
            some: {
              playerId: ctx.player.id,
            },
          },
          tier: {
            not: null,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        distinct: ["tier"],
        select: {
          id: true,
          tier: true,
        },
      })

      if (!battles.length) {
        return []
      }

      let fighters = await Promise.all(
        battles?.map(async ({ tier, id: battleId }) => {
          if (!tier) {
            throw new Error("Tier not found")
          }
          const pokemonSet = await getDungeonFighter({
            level: tier,
            seed: `${input.placeId}-${tier}`,
          })
          const fighter = transformPokemonSetToPlus({
            pokemonSet,
            isTraded: false,
          })
          return { fighter, battleId, tier }
        })
      )

      fighters = orderBy(fighters, (f) => f.tier, "asc")

      return fighters
    }),
})

export const startDungeonBattle = async ({
  prisma,
  placeId,
  tier,
  player,
  startWithCatchId,
}: {
  prisma: MyPrismaClient
  placeId: string
  tier: number
  player: {
    id: string
    lat?: number
    lng?: number
    metadata: PlayerMetadata
  }
  startWithCatchId?: string
}) => {
  const playerId = player.id
  const battle = await prisma.battle.create({
    data: {
      status: "IN_PROGRESS",
      metadata: {} satisfies BattleMetadata,
      battleParticipants: {
        create: [
          {
            metadata: {
              startWithCatchId,
            } satisfies BattleParticipationMetadata,
            playerId,
          },
          {
            metadata: {
              isPlaceEncounter: true,
            } satisfies BattleParticipationMetadata,
          },
        ],
      },
      placeId,
      tier,
    },
    select: {
      id: true,
    },
  })

  await prisma.player.update({
    where: {
      id: playerId,
    },
    data: {
      lat: player.lat,
      lng: player.lng,
      metadata: {
        ...player.metadata,
        activeBattleId: battle.id,
        navigation: null,
      } satisfies PlayerMetadata,
    },
  })

  return battle
}

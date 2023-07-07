import { TRPCError } from "@trpc/server"
import { map } from "lodash-es"
import { createTRPCRouter } from "~/server/api/trpc"
import { BattleMetadata } from "~/server/schema/BattleMetadata"
import { BattleParticipationMetadata } from "~/server/schema/BattleParticipationMetadata"
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
    if (playerInFight) {
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

    await ctx.prisma.battle.create({
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
})

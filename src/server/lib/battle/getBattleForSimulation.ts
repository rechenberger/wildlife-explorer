import { BATTLE_INPUT_VERSION } from "~/config"
import { type MyPrismaClient } from "~/server/db"
import { CatchMetadata } from "~/server/schema/CatchMetadata"
import { WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
import { BattleReportWildlifeMetadata } from "./BattleReport"

const BattleSimulationWildlifeMetadata = BattleReportWildlifeMetadata.merge(
  WildlifeMetadata.pick({
    taxonAncestorIds: true,
    observationCaptive: true,
  })
)

const BattleSimulationCatchMetadata = CatchMetadata.pick({
  level: true,
  moves: true,
  hp: true,
  evs: true,
  speciesName: true,
})

export const getBattleForSimulation = async ({
  prisma,
  battleId,
  playerPartyLimit,
}: {
  prisma: MyPrismaClient
  battleId: string
  playerPartyLimit: number
}) => {
  const battleRaw = await prisma.battle.findUniqueOrThrow({
    where: {
      id: battleId,
    },
    select: {
      id: true,
      battleParticipants: {
        select: {
          id: true,
          metadata: true,
          player: {
            select: {
              id: true,
              name: true,
              catches: {
                where: {
                  battleOrderPosition: {
                    not: null,
                  },
                },
                select: {
                  id: true,
                  seed: true,
                  name: true,
                  playerId: true,
                  originalPlayerId: true,
                  wildlife: {
                    select: {
                      id: true,
                      metadata: true,
                      taxon: {
                        select: {
                          fighterSpeciesName: true,
                          // fighterSpeciesNum: true,
                        },
                      },
                    },
                  },
                  metadata: true,
                },
                take: playerPartyLimit,
                orderBy: {
                  battleOrderPosition: "asc",
                },
              },
            },
          },
          wildlife: {
            select: {
              id: true,
              metadata: true,
              observationId: true,
              respawnsAt: true,
              taxon: {
                select: {
                  fighterSpeciesName: true,
                  // fighterSpeciesNum: true,
                },
              },
            },
          },
        },
        orderBy: {
          id: "asc",
        },
      },
      placeId: true,
      tier: true,
    },
  })
  const battleInput = {
    version: BATTLE_INPUT_VERSION,
    id: battleRaw.id,
    battleParticipants: battleRaw.battleParticipants.map((bp) => ({
      ...bp,
      wildlife: bp.wildlife
        ? {
            ...bp.wildlife,
            // This is for optimizing the size of metadata:
            metadata: BattleSimulationWildlifeMetadata.parse(
              bp.wildlife.metadata
            ),
            respawnsAt: bp.wildlife.respawnsAt?.toISOString(),
          }
        : null,
      player: bp.player
        ? {
            ...bp.player,
            catches: bp.player.catches.map((c) => ({
              ...c,
              metadata: BattleSimulationCatchMetadata.parse(c.metadata),
              wildlife: {
                ...c.wildlife,
                metadata: BattleSimulationWildlifeMetadata.parse(
                  c.wildlife.metadata
                ),
              },
            })),
          }
        : null,
    })),
    placeId: battleRaw.placeId,
    tier: battleRaw.tier,
  }
  // console.log("battleInput", JSON.stringify(battleInput, null, 2))

  return battleInput
}

export type BattleInput = Awaited<ReturnType<typeof getBattleForSimulation>>

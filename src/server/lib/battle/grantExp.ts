import { filter, flatMap, map } from "lodash-es"
import { getLevelFromExp } from "~/data/pokemonLevelExperienceMap"
import { type MyPrismaClient } from "~/server/db"
import { calcExpForDefeatedPokemon } from "~/utils/calcExpForDefeatedPokemon"
import { calcExpPercentage } from "~/utils/calcExpPercentage"
import { type BattleReport } from "./BattleReport"

export const grantExp = async ({
  battleReport,
  prisma,
  winnerParticipationId,
  onlyFaintedGiveExp,
}: {
  battleReport: BattleReport
  prisma: MyPrismaClient
  winnerParticipationId: string
  onlyFaintedGiveExp: boolean
}) => {
  // console.log("winnerParticipationId", winnerParticipationId)
  const winnerSides = filter(
    battleReport.sides,
    (s) => s.participationId === winnerParticipationId
  )
  // console.log("winnerSides", winnerSides)
  const winnerFighters = flatMap(winnerSides, (s) => s.fighters)
  // console.log("winnerFighters", winnerFighters)

  const looserSides = filter(
    battleReport.sides,
    (s) => s.participationId !== winnerParticipationId
  )
  // console.log("looserSides", looserSides)
  const defeatedFighters = flatMap(looserSides, (s) => s.fighters).filter((f) =>
    onlyFaintedGiveExp ? f.fainted : true
  )
  // console.log("defeatedFighters", defeatedFighters)

  const expReports = await Promise.all(
    map(winnerFighters, async (winnerFighter) => {
      if (!winnerFighter.catch?.id || winnerFighter.fainted) {
        return {
          battleReportFighter: winnerFighter,
          fainted: true,
        }
      }
      const winningCatch = await prisma.catch.findUniqueOrThrow({
        where: {
          id: winnerFighter.catch.id,
        },
      })

      let expGained = 0

      for (const looserFighter of defeatedFighters) {
        expGained += calcExpForDefeatedPokemon({
          defeatedFighter: looserFighter.fighter,
          receivingFighter: winningCatch.metadata,
          participatedInBattle: !!winnerFighter.activeTurns,
          isOriginalOwner:
            winningCatch.originalPlayerId === winningCatch.playerId,
        })
      }

      const expBefore = winningCatch.metadata.exp || 0
      const levelBefore = winningCatch.metadata.level || 1
      const expAfter = expBefore + expGained
      const levelAfter =
        getLevelFromExp({
          ...winningCatch.metadata,
          exp: expAfter,
        }) ?? levelBefore
      const levelGained = levelAfter - levelBefore

      const levelingRate = winningCatch.metadata.levelingRate
      const expPercentageBefore = calcExpPercentage({
        exp: expBefore,
        level: levelBefore,
        levelingRate,
      })
      const expPercentageAfter = calcExpPercentage({
        exp: expAfter,
        level: levelAfter,
        levelingRate,
      })

      await prisma.catch.update({
        where: {
          id: winnerFighter.catch.id,
        },
        data: {
          metadata: {
            ...winningCatch.metadata,
            exp: expAfter,
            level: levelAfter,
          },
        },
        select: {
          id: true,
        },
      })

      return {
        battleReportFighter: winnerFighter,
        catchId: winnerFighter.catch.id,
        expBefore,
        expGained,
        expAfter,
        levelBefore,
        levelAfter,
        levelGained,
        expPercentageBefore,
        expPercentageAfter,
      }
    })
  )

  return {
    expReports,
  }
}

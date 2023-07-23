import { type Wildlife } from "@prisma/client"
import { findIndex, map, orderBy, uniqBy } from "lodash-es"
import { SHOW_FUTURE_MOVES } from "~/config"
import { type MyPrismaClient } from "~/server/db"
import { type CatchMetadata } from "~/server/schema/CatchMetadata"
import { type WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
import { getWildlifeFighterPlusMove } from "./WildlifeFighterPlusMove"
import { getMovesInLearnset } from "./getWildlifeFighter"
import { getWildlifeFighterPlus } from "./getWildlifeFighterPlus"

export const getPossibleMovesByCatchId = async ({
  prisma,
  catchId,
  playerId,
}: {
  prisma: MyPrismaClient
  catchId: string
  playerId: string
}) => {
  const c = await prisma.catch.findFirstOrThrow({
    where: {
      id: catchId,
      playerId,
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
  return getPossibleMovesByCatch({ c })
}

export const getPossibleMovesByCatch = async ({
  c,
}: {
  c: {
    id: string
    metadata: CatchMetadata
    wildlife: Wildlife & { metadata: WildlifeMetadata } & {
      taxon: { fighterSpeciesName: string }
    }
    seed: string
  }
}) => {
  const fighter = await getWildlifeFighterPlus(c)
  const movesLearnedSaved = map(c.metadata?.movesLearned, (move) => ({
    move,
    level: null,
  }))
  let learnsetMoves = await getMovesInLearnset(fighter.species)
  learnsetMoves = orderBy(learnsetMoves, (m) => m.level)

  let both = [...movesLearnedSaved, ...learnsetMoves]
  both = uniqBy(both, (m) => m.move)

  let allMoves = both.map((move) => {
    const movePlus = getWildlifeFighterPlusMove({
      move: move.move,
    })
    let activeIdx: number | null = findIndex(
      fighter.moves,
      (m) => m.id === movePlus.id
    )
    activeIdx = activeIdx === -1 ? null : activeIdx
    const learned = move.level ? fighter.level >= move.level : true

    return {
      ...movePlus,
      activeIdx,
      learned,
      level: move.level,
    }
  })

  allMoves = orderBy(allMoves, [(m) => m.activeIdx])
  if (!SHOW_FUTURE_MOVES) {
    allMoves = allMoves.filter((m) => m.learned)
  }
  return { allMoves, c }
}

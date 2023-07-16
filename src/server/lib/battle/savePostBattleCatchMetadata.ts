import { map } from "lodash-es"
import { type MyPrismaClient } from "~/server/db"
import { type CatchMetadata } from "~/server/schema/CatchMetadata"
import { type BattleReport } from "./BattleReport"

export const savePostBattleCatchMetadata = async ({
  prisma,
  battleReport,
}: {
  prisma: MyPrismaClient
  battleReport: BattleReport
}) => {
  await Promise.all(
    map(battleReport.sides, async (side) => {
      await Promise.all(
        map(side.fighters, async (fighter) => {
          if (!fighter.catch?.id) {
            return
          }
          const moves = map(fighter.fighter.moves, (m) => {
            if (!m.id) {
              throw new Error("Move id missing")
            }
            return {
              id: m.id,
              pp: m.status?.pp ?? m.definition.pp,
            }
          })

          const { metadata } = await prisma.catch.findFirstOrThrow({
            where: {
              id: fighter.catch.id,
            },
            select: {
              metadata: true,
            },
          })

          await prisma.catch.update({
            where: {
              id: fighter.catch.id,
            },
            data: {
              metadata: {
                ...metadata,
                moves,
              } satisfies CatchMetadata,
            },
          })
        })
      )
    })
  )
}

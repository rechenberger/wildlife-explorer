import { TRPCError } from "@trpc/server"
import { find } from "lodash-es"
import { type MyPrismaClient } from "~/server/db"
import { type PlayerMetadata } from "~/server/schema/PlayerMetadata"

export const checkIfReadyForBattle = async ({
  prisma,
  player,
}: {
  prisma: MyPrismaClient
  player: {
    id: string
    metadata: PlayerMetadata
  }
}) => {
  if (player.metadata?.activeBattleId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You are already in a battle",
    })
  }

  const team = await prisma.catch.findMany({
    where: {
      playerId: player.id,
      battleOrderPosition: {
        not: null,
      },
    },
  })
  if (!team?.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You need to catch at least one wildlife to battle 😉",
    })
  }
  const fighterWithHp = find(team, (c) => {
    if (typeof c.metadata?.hp !== "number") {
      return true
    }
    return c.metadata?.hp > 0
  })
  if (!fighterWithHp) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Your whole team is fainted 🤦",
    })
  }
}

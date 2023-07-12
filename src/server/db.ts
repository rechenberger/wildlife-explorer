import { PlayerPayload, PrismaClient } from "@prisma/client"
import { Types } from "@prisma/client/runtime"
import { env } from "~/env.mjs"
import { BattleMetadata } from "./schema/BattleMetadata"
import { BattleParticipationMetadata } from "./schema/BattleParticipationMetadata"
import { CatchMetadata } from "./schema/CatchMetdata"
import { PlayerMetadata } from "./schema/PlayerMetadata"
import { WildlifeMetadata } from "./schema/WildlifeMetadata"

const createPrisma = () => {
  return new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends({
    result: {
      catch: {
        metadata: {
          needs: {
            metadata: true,
          },
          compute: (data) => {
            return CatchMetadata.parse(data.metadata || {})
          },
        },
      },
      battle: {
        metadata: {
          needs: {
            metadata: true,
          },
          compute: (data) => {
            return BattleMetadata.parse(data.metadata || {})
          },
        },
      },
      player: {
        metadata: {
          needs: {
            metadata: true,
          },
          compute: (data) => {
            return PlayerMetadata.parse(data.metadata || {})
          },
        },
      },
      wildlife: {
        metadata: {
          needs: {
            metadata: true,
          },
          compute: (data) => {
            return WildlifeMetadata.parse(data.metadata || {})
          },
        },
      },
      battleParticipation: {
        metadata: {
          needs: {
            metadata: true,
          },
          compute: (data) => {
            return BattleParticipationMetadata.parse(data.metadata || {})
          },
        },
      },
    },
  })
}

export type MyPrismaClient = ReturnType<typeof createPrisma>
const globalForPrisma = globalThis as unknown as {
  prisma: MyPrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrisma()

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

type ExtArgs = PlayerPayload<(typeof prisma)["$extends"]["extArgs"]>
export type Player = Types.GetResult<ExtArgs, {}, "findUniqueOrThrow">

import { PrismaClient, type Player } from "@prisma/client"
import { env } from "~/env.mjs"
import { BattleMetadata } from "./schema/BattleMetadata"
import { BattleParticipationMetadata } from "./schema/BattleParticipationMetadata"
import { CatchMetadata } from "./schema/CatchMetadata"
import { PlaceMetadata } from "./schema/PlaceMetadata"
import { PlayerMetadata } from "./schema/PlayerMetadata"
import { WildlifeMetadata } from "./schema/WildlifeMetadata"
import { TaxonMetadata } from "./schema/TaxonMetadata"

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
      place: {
        metadata: {
          needs: {
            metadata: true,
          },
          compute: (data) => {
            return PlaceMetadata.parse(data.metadata || {})
          },
        },
      },
      taxon: {
        metadata: {
          needs: {
            metadata: true,
          },
          compute: (data) => {
            return TaxonMetadata.parse(data.metadata || {})
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

// TODO: find a solution to do this in prisma 5. This is the version of prisma 4:
// import { type PlayerPayload } from "@prisma/client"
// import { type Types } from "@prisma/client/runtime"
// type ExtArgs = PlayerPayload<(typeof prisma)["$extends"]["extArgs"]>
// export type PlayerWithMetadata = Types.GetResult<
//   ExtArgs,
//   {},
//   "findUniqueOrThrow"
// >
export type PlayerWithMetadata = Omit<Player, "metadata"> & {
  metadata: PlayerMetadata
}

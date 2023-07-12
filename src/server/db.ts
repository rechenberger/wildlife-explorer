import { PrismaClient } from "@prisma/client"
import { env } from "~/env.mjs"
import { CatchMetadata } from "./schema/CatchMetdata"

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
            return CatchMetadata.parse(data.metadata)
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

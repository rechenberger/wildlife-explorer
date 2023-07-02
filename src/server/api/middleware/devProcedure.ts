import { TRPCError } from "@trpc/server"
import { publicProcedure } from "../trpc"

export const devProcedure = publicProcedure.use(async ({ next }) => {
  if (process.env.NODE_ENV === "development") {
    return next()
  }
  throw new TRPCError({
    code: "UNAUTHORIZED",
  })
})

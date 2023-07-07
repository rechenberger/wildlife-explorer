import { TRPCError } from "@trpc/server"
import { DEV_MODE } from "~/config"
import { publicProcedure } from "../trpc"

export const devProcedure = publicProcedure.use(async ({ next }) => {
  if (DEV_MODE) {
    return next()
  }
  throw new TRPCError({
    code: "UNAUTHORIZED",
  })
})

import { exampleRouter } from "~/server/api/routers/example.router"
import { createTRPCRouter } from "~/server/api/trpc"
import { navigationRouter } from "./routers/navigation.router"
import { wildlifeRouter } from "./routers/wildlife.router"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  wildlife: wildlifeRouter,
  navigation: navigationRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

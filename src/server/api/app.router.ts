import { exampleRouter } from "~/server/api/routers/example.router"
import { createTRPCRouter } from "~/server/api/trpc"
import { battleRouter } from "./routers/battle.router"
import { catchRouter } from "./routers/catch.router"
import { migrationRouter } from "./routers/migration.router"
import { navigationRouter } from "./routers/navigation.router"
import { playerRouter } from "./routers/player.router"
import { pvpRouter } from "./routers/pvp.router"
import { socialRouter } from "./routers/social.router"
import { taxonRouter } from "./routers/taxon.router"
import { tradeRouter } from "./routers/trader.router"
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
  player: playerRouter,
  catch: catchRouter,
  battle: battleRouter,
  taxon: taxonRouter,
  social: socialRouter,
  pvp: pvpRouter,
  trade: tradeRouter,
  migration: migrationRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

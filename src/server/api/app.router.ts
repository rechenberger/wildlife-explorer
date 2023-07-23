import { exampleRouter } from "~/server/api/routers/example.router"
import { createTRPCRouter } from "~/server/api/trpc"
import { battleRouter } from "./routers/battle.router"
import { catchRouter } from "./routers/catch.router"
import { evolutionRouter } from "./routers/evolution.router"
import { migrationRouter } from "./routers/migration.router"
import { moveRouter } from "./routers/move.router"
import { navigationRouter } from "./routers/navigation.router"
import { placeRouter } from "./routers/place.router"
import { playerRouter } from "./routers/player.router"
import { pvpRouter } from "./routers/pvp.router"
import { scanRouter } from "./routers/scan.router"
import { socialRouter } from "./routers/social.router"
import { taxonRouter } from "./routers/taxon.router"
import { tradeRouter } from "./routers/trade.router"
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
  move: moveRouter,
  place: placeRouter,
  scan: scanRouter,
  evolution: evolutionRouter,
  trade: tradeRouter,
  migration: migrationRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

import { TRPCError } from "@trpc/server"
import { addSeconds } from "date-fns"
import { SCAN_COOLDOWN_IN_SECONDS } from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { scanPlaces } from "~/server/lib/scanPlaces"
import { scanWildlife } from "~/server/lib/scanWildlife"
import { playerProcedure } from "../middleware/playerProcedure"

export const scanRouter = createTRPCRouter({
  scan: playerProcedure.mutation(async ({ ctx }) => {
    if (ctx.player.scanCooldownAt && ctx.player.scanCooldownAt > new Date()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Scan is on cooldown",
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [cooldown, places, wildlife] = await Promise.all([
      ctx.prisma.player.update({
        where: {
          id: ctx.player.id,
        },
        data: {
          scanCooldownAt: addSeconds(new Date(), SCAN_COOLDOWN_IN_SECONDS),
        },
      }),
      scanPlaces({
        prisma: ctx.prisma,
        playerId: ctx.player.id,
        location: {
          lat: ctx.player.lat,
          lng: ctx.player.lng,
        },
      }),
      scanWildlife({
        prisma: ctx.prisma,
        playerId: ctx.player.id,
        location: {
          lat: ctx.player.lat,
          lng: ctx.player.lng,
        },
      }),
    ])

    return { places, wildlife }
  }),
})

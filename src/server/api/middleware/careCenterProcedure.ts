import { TRPCError } from "@trpc/server"
import { RADIUS_IN_M_CARE_CENTER } from "~/config"
import { type MyPrismaClient, type PlayerWithMetadata } from "~/server/db"
import { calculateBoundingBox } from "~/server/lib/latLng"
import { playerProcedure } from "./playerProcedure"

export const careCenterProcedure = playerProcedure.use(
  async ({ ctx, next }) => {
    const careCenter = await checkForCareCenter({ ctx })

    return next({
      ctx: {
        ...ctx,
        careCenter,
      },
    })
  }
)

export const checkForCareCenter = async ({
  ctx,
}: {
  ctx: {
    player: PlayerWithMetadata
    prisma: MyPrismaClient
  }
}) => {
  const bbox = calculateBoundingBox({
    center: ctx.player,
    radiusInKm: RADIUS_IN_M_CARE_CENTER / 1000,
  })

  const careCenter = await ctx.prisma.place.findFirst({
    where: {
      lat: {
        gte: bbox.minLat,
        lte: bbox.maxLat,
      },
      lng: {
        gte: bbox.minLng,
        lte: bbox.maxLng,
      },
      type: "CARE_CENTER",
    },
  })

  if (!careCenter) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `This can only be done at a Wildlife Care Center. Try scanning and getting in a ${RADIUS_IN_M_CARE_CENTER}m range.`,
    })
  }

  if (ctx.player.metadata?.activeBattleId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Wildlife Care Centers cannot be visited while in a battle.`,
    })
  }

  return careCenter
}

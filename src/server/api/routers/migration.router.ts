import { MAX_FIGHTERS_PER_TEAM } from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { devProcedure } from "../middleware/devProcedure"

export const migrationRouter = createTRPCRouter({
  taxons: devProcedure.mutation(async ({ ctx }) => {
    const wildlife = await ctx.prisma.wildlife.findMany({
      distinct: ["taxonId"],
      take: 10,
    })
    console.log(wildlife)
    return wildlife
  }),

  battleOrder: devProcedure.mutation(async ({ ctx }) => {
    const players = await ctx.prisma.player.findMany({})
    for (const player of players) {
      const catches = await ctx.prisma.catch.findMany({
        where: {
          playerId: player.id,
        },
        orderBy: [
          {
            battleOrderPosition: {
              sort: "desc",
              nulls: "last",
            },
          },
          {
            createdAt: "desc",
          },
        ],
      })
      for (const [index, c] of catches.entries()) {
        await ctx.prisma.catch.update({
          where: {
            id: c.id,
          },
          data: {
            battleOrderPosition:
              index < MAX_FIGHTERS_PER_TEAM ? index + 1 : null,
          },
        })
      }
    }
  }),
})

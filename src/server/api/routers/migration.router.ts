import { createTRPCRouter } from "~/server/api/trpc"
import { createSeed } from "~/utils/seed"
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

  seed: devProcedure.mutation(async ({ ctx }) => {
    const catches = await ctx.prisma.catch.findMany({
      select: {
        id: true,
        createdAt: true,
        wildlife: {
          select: {
            observationId: true,
          },
        },
      },
    })

    await Promise.all(
      catches.map(async (catched) => {
        await ctx.prisma.catch.update({
          where: {
            id: catched.id,
          },
          data: {
            seed: createSeed({
              observationId: catched.wildlife.observationId,
              respawnsAt: catched.createdAt,
            }),
          },
        })
      })
    )
  }),
})

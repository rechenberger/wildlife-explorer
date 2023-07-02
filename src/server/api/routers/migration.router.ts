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
})

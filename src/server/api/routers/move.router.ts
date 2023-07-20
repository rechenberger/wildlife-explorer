import { TRPCError } from "@trpc/server"
import { orderBy, uniqBy } from "lodash-es"
import { z } from "zod"
import { MAX_FIGHTERS_PER_TEAM } from "~/config"
import { createTRPCRouter } from "~/server/api/trpc"
import { type CatchMetadata } from "~/server/schema/CatchMetadata"
import { getPossibleMoves } from "../../lib/battle/getPossibleMoves"
import { careCenterProcedure } from "../middleware/careCenterProcedure"
import { playerProcedure } from "../middleware/playerProcedure"

export const moveRouter = createTRPCRouter({
  getPossibleMoves: playerProcedure
    .input(
      z.object({
        catchId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { allMoves } = await getPossibleMoves({
        prisma: ctx.prisma,
        catchId: input.catchId,
        playerId: ctx.player.id,
      })
      return allMoves
    }),

  swap: careCenterProcedure
    .input(
      z.object({
        catchId: z.string(),
        oldMoveId: z.string().optional(),
        newMoveId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { allMoves, c } = await getPossibleMoves({
        prisma: ctx.prisma,
        catchId: input.catchId,
        playerId: ctx.player.id,
      })
      // if (filter(allMoves, (m) => m.learned).length < MAX_MOVES_PER_FIGHTER) {
      //   throw new TRPCError({
      //     code: "BAD_REQUEST",
      //     message: `Move Swap will be available after learning your ${
      //       MAX_MOVES_PER_FIGHTER + 1
      //     }th move`,
      //   })
      // }

      const newMove = allMoves.find((m) => m.id === input.newMoveId)
      if (!newMove) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "New move not found",
        })
      }
      if (!newMove.learned) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "New move not learned",
        })
      }

      const oldMove = allMoves.find((m) => m.id === input.oldMoveId)
      if (input.oldMoveId && !oldMove) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Old move not found",
        })
      }
      if (input.oldMoveId && oldMove?.activeIdx === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Old move not active",
        })
      }

      let currentMoves = orderBy(
        allMoves.filter((m) => m.activeIdx !== null),
        (m) => m.activeIdx
      )

      if (oldMove && oldMove.activeIdx !== null) {
        currentMoves[oldMove.activeIdx] = newMove
        if (typeof newMove.activeIdx === "number") {
          currentMoves[newMove.activeIdx] = oldMove
        }
      } else {
        currentMoves.push(newMove)
        if (typeof newMove.activeIdx === "number") {
          currentMoves.splice(newMove.activeIdx, 1)
        }
      }

      let moves = currentMoves.map((m) => ({
        id: m.id,
        pp: m.status?.pp || m.definition.pp,
      }))
      moves = uniqBy(moves, (m) => m.id)

      if (moves.length > MAX_FIGHTERS_PER_TEAM) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Too many moves",
        })
      }

      await ctx.prisma.catch.update({
        where: {
          id: c.id,
        },
        data: {
          metadata: {
            ...c.metadata,
            moves,
          } satisfies CatchMetadata,
        },
      })
    }),

  reset: playerProcedure
    .input(
      z.object({
        catchId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const c = await ctx.prisma.catch.findFirstOrThrow({
        where: {
          id: input.catchId,
          playerId: ctx.player.id,
        },
      })
      await ctx.prisma.catch.update({
        where: {
          id: c.id,
        },
        data: {
          metadata: {
            ...c.metadata,
            moves: null,
          } satisfies CatchMetadata,
        },
      })
    }),
})

import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

import Pokedex from "pokedex-promise-v2"
const P = new Pokedex({})

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({}) => {
      // const result = await P.getPokemonsList()
      const result = await P.getPokemonByName(1)
      // result.

      return result
    }),
})

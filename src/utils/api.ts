/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `api` object which
 * contains the Next.js App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types.
 */
import { httpBatchLink, loggerLink } from "@trpc/client"
import { createTRPCNext } from "@trpc/next"
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server"
import { createTRPCJotai } from "jotai-trpc"
import superjson from "superjson"
import { z } from "zod"
import { type AppRouter } from "~/server/api/app.router"

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "" // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}` // dev SSR should use localhost
}

const trpcConfig = {
  /**
   * Transformer used for data de-serialization from the server.
   *
   * @see https://trpc.io/docs/data-transformers
   */
  transformer: superjson,

  /**
   * Links used to determine request flow from client to server.
   *
   * @see https://trpc.io/docs/links
   */
  links: [
    loggerLink({
      enabled: (opts) => {
        // Always log errors
        if (opts.direction === "down" && opts.result instanceof Error) {
          return true
        }

        // In Development...
        if (process.env.NODE_ENV === "development") {
          const betterOptions = z
            .object({
              id: z.number(),
              direction: z.string(), // up | down ?
              type: z.enum(["query", "mutation"]),
              path: z.string(),
              input: z.any(),
              result: z.any(),
            })
            .safeParse(opts)

          // Log when not parsed correctly
          if (!betterOptions.success) {
            console.error(betterOptions.error, opts)
            return true
          }

          // Log only mutations
          if (betterOptions.data.type === "mutation") {
            return true
          }
        }
        return false
      },
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
}

/** A set of type-safe react-query hooks for your tRPC API. */
export const api = createTRPCNext<AppRouter>({
  config() {
    return trpcConfig
  },
  /**
   * Whether tRPC should await queries when server rendering pages.
   *
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   */
  ssr: false,
})

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>

export const apiJotai = createTRPCJotai<AppRouter>(trpcConfig)

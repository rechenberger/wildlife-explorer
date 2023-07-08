import { map } from "lodash-es"
import Image from "next/image"
import { api } from "~/utils/api"
import { cn } from "./cn"
import { useGetWildlifeName } from "./useGetWildlifeName"
import { usePlayer } from "./usePlayer"

export const MyCatches = () => {
  const { playerId } = usePlayer()
  const { data: catches } = api.catch.getMyCatches.useQuery(
    {
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
    }
  )
  const getName = useGetWildlifeName()
  return (
    <>
      <div className="grid grid-cols-6 gap-2 gap-y-3">
        {map(catches, (c) => (
          <div
            key={c.id}
            className="flex flex-col gap-2 rounded bg-black/10 px-1 pt-2"
          >
            <div
              className={cn(
                "self-center",
                "relative aspect-square h-12 w-12 shrink-0 overflow-hidden rounded-full ring",
                "ring-amber-400"
              )}
            >
              {c.wildlife.metadata.taxonImageUrlSquare && (
                <Image
                  src={c.wildlife.metadata.taxonImageUrlSquare}
                  className="w-full object-cover object-center"
                  alt={"Observation"}
                  unoptimized
                  fill={true}
                />
              )}
            </div>
            <div className="truncate text-center text-xs opacity-60">
              {getName(c.wildlife)}
            </div>
            {/* <div></div> */}
          </div>
        ))}
      </div>
    </>
  )
}

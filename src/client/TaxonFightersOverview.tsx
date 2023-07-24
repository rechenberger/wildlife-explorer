import { map } from "lodash-es"
import Image from "next/image"
import { api } from "~/utils/api"
import { cn } from "./cn"
import { getFighterImage } from "./getFighterImage"
import { usePlayer } from "./usePlayer"

export const TaxonFightersOverview = () => {
  const { playerId } = usePlayer()
  const { data } = api.taxon.getFighters.useQuery(
    {
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
    }
  )
  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {map(data, (fighter) => (
          <div
            key={fighter.num}
            className="text-xs flex flex-col text-center bg-gray-200 p-1 rounded"
          >
            <div>
              <Image
                src={getFighterImage({
                  fighterSpeciesNum: fighter.num,
                })}
                className={cn("h-full w-full")}
                alt={fighter.name}
                unoptimized
                width={1}
                height={1}
              />
            </div>
            <div className="font-mono">#{fighter.num}</div>
            <div>{fighter.name}</div>
          </div>
        ))}
      </div>
    </>
  )
}

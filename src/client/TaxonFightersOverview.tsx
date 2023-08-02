import NiceModal from "@ebay/nice-modal-react"
import { map } from "lodash-es"
import Image from "next/image"
import { api } from "~/utils/api"
import { TaxonOverviewModal } from "./TaxonOverviewModal"
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
      <div className="text-center">{data?.length} Fighters</div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {map(data, (fighter) => (
          <div
            key={fighter.num}
            className="text-xs flex flex-col text-center bg-gray-200 p-1 rounded hover:bg-gray-300 cursor-pointer"
            onClick={() => {
              NiceModal.show(TaxonOverviewModal, {
                taxonId: fighter.taxonId,
              })
            }}
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

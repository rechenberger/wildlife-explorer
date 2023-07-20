import NiceModal from "@ebay/nice-modal-react"
import { orderBy } from "lodash-es"
import { useMemo } from "react"
import { CurrentObservationModal } from "./CurrentObservationModal"
import { FighterChip } from "./FighterChip"
import { useWildlife } from "./WildlifeMarkers"

export const WildlifeNearMe = () => {
  const { wildlife } = useWildlife()
  const wildlifeSorted = useMemo(() => {
    return orderBy(wildlife, (w) => w.fighter.level, "desc")
  }, [wildlife])
  return (
    <>
      <div className="absolute right-0 inset-y-0 p-4 rounded z-40 overflow-auto hidden lg:flex">
        <div className="flex flex-col gap-3 text-black">
          {wildlifeSorted?.map((w) => {
            return (
              <div key={w.wildlife.id} className="flex flex-row gap-2">
                <div className="w-44">
                  <FighterChip
                    fighter={w}
                    showAbsoluteHp={false}
                    ltr={false}
                    onClick={() => {
                      NiceModal.show(CurrentObservationModal, {
                        wildlifeId: w.wildlife.id,
                      })
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

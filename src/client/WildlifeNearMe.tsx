import NiceModal from "@ebay/nice-modal-react"
import { orderBy } from "lodash-es"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useMemo, useState } from "react"
import { CurrentObservationModal } from "./CurrentObservationModal"
import { FighterChip } from "./FighterChip"
import { useWildlife } from "./WildlifeMarkers"
import { cn } from "./cn"

export const WildlifeNearMe = () => {
  const { wildlife } = useWildlife()
  const wildlifeSorted = useMemo(() => {
    return orderBy(wildlife, (w) => w.fighter.level, "desc")
  }, [wildlife])
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <>
      <button
        className="absolute top-8 pt-1 right-4 text-white [text-shadow:_0px_0px_2px_rgb(0_0_0_/_80%)] z-40 lg:hidden"
        onClick={() => setMobileOpen((open) => !open)}
      >
        {mobileOpen ? (
          <ChevronUp className="w-6 h-6" />
        ) : (
          <ChevronDown className="w-6 h-6" />
        )}
      </button>
      <div
        className={cn(
          "absolute right-0 p-4 rounded z-40 overflow-auto hidden lg:flex",
          "top-16 lg:top-0 bottom-20 lg:bottom-0",
          mobileOpen && "flex"
        )}
      >
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

import NiceModal from "@ebay/nice-modal-react"
import { filter, orderBy } from "lodash-es"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useMemo, useState } from "react"
import { SHOW_WILDLIFE_NEAR_ME_LIST_MOBILE } from "~/config"
import { CurrentObservationModal } from "./CurrentObservationModal"
import { FighterChip } from "./FighterChip"
import { useWildlife } from "./WildlifeMarkers"
import { cn } from "./cn"

export const WildlifeNearMe = () => {
  const { wildlife } = useWildlife()
  const wildlifeSorted = useMemo(() => {
    let result = wildlife
    result = filter(result, (w) => !w.wildlife.caughtAt)
    result = orderBy(
      result,
      [
        (w) => (w.wildlife.metadata.observationCaptive ? 1 : 0),
        (w) => w.fighter.level,
      ],
      ["desc", "desc"]
    )
    return result
  }, [wildlife])
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <>
      {SHOW_WILDLIFE_NEAR_ME_LIST_MOBILE && (
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
      )}
      <div
        className={cn(
          "absolute right-0 p-4 rounded z-40 overflow-auto hidden lg:flex",
          "top-16 lg:top-0 bottom-20 lg:bottom-0",
          mobileOpen && "flex"
        )}
        style={
          mobileOpen
            ? {
                bottom: "calc(env(safe-area-inset-bottom) + 5rem)",
              }
            : undefined
        }
      >
        <div className="flex flex-col gap-3 text-black">
          {wildlifeSorted?.map((w) => {
            const isRespawning = w.wildlife.respawnsAt > new Date()
            return (
              <div key={w.wildlife.id} className="flex flex-row gap-2">
                <div className="w-44">
                  <FighterChip
                    fighter={w}
                    showAbsoluteHp={false}
                    ltr={false}
                    grayscale={isRespawning}
                    onClick={() => {
                      NiceModal.show(CurrentObservationModal, {
                        wildlifeId: w.wildlife.id,
                      })
                    }}
                    circleClassName={cn(
                      w.wildlife.metadata.observationCaptive
                        ? "ring-orange-700"
                        : "ring-amber-400"
                    )}
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

import NiceModal from "@ebay/nice-modal-react"
import { filter, orderBy } from "lodash-es"
import { Fragment, useMemo } from "react"
import { BattleViewModal } from "./BattleViewModal"
import { CurrentObservationModal } from "./CurrentObservationModal"
import { FighterChip } from "./FighterChip"
import { MyCatchesModal } from "./MyCatchesModal"
import { TypeBadge } from "./TypeBadge"
import { useWildlife } from "./WildlifeMarkers"
import { cn } from "./cn"
import { careIcon, pastIcon, swapIcon } from "./typeIcons"

export const BattleFastView = () => {
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

  return (
    <>
      <div className="flex flex-col pt-6 gap-4 flex-1 ">
        <div className="flex flex-row flex-1 max-h-[calc(100svh-200px)] max-w-[calc(100svw)] -mx-4 p-1">
          <div className="flex-1 flex flex-col gap-1 overflow-hidden">
            <div className="px-3 font-bold text-xs opacity-60 text-left">
              My Team
            </div>
            <div className="flex flex-col gap-3 p-2 text-black flex-1 overflow-auto">
              {wildlifeSorted?.map((w) => {
                const isRespawning = w.wildlife.respawnsAt > new Date()
                return (
                  <Fragment key={w.wildlife.id}>
                    <FighterChip
                      fighter={w}
                      showAbsoluteHp={false}
                      ltr={true}
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
                  </Fragment>
                )
              })}
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1 overflow-hidden">
            <div className="px-3 font-bold text-xs opacity-60 text-right">
              Wildlife
            </div>
            <div className="flex flex-col gap-3 p-2 text-black flex-1 overflow-auto">
              {wildlifeSorted?.map((w) => {
                const isRespawning = w.wildlife.respawnsAt > new Date()
                return (
                  <Fragment key={w.wildlife.id}>
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
                  </Fragment>
                )
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <TypeBadge
            icon={swapIcon}
            content={"Swap"}
            size="big"
            className="flex-1"
            onClick={() => {
              NiceModal.show(MyCatchesModal)
            }}
          />
          <TypeBadge
            icon={careIcon}
            content={"Care"}
            size="big"
            className="flex-1"
            onClick={() => {}}
          />
          <TypeBadge
            icon={pastIcon}
            content={"Recent"}
            size="big"
            className="flex-1"
            onClick={() => {
              NiceModal.show(BattleViewModal)
            }}
          />
        </div>
      </div>
    </>
  )
}

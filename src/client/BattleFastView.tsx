import NiceModal from "@ebay/nice-modal-react"
import { useStore } from "jotai"
import { Fragment } from "react"
import { RADIUS_IN_M_CATCH_WILDLIFE } from "~/config"
import { calcDistanceInMeter } from "~/server/lib/latLng"
import { AutoBattleModal } from "./AutoBattleModal"
import { BattleViewModal } from "./BattleViewModal"
import { useCare } from "./CareButton"
import { CatchDetailsModal } from "./CatchDetailsModal"
import { CurrentObservationModal } from "./CurrentObservationModal"
import { FighterChip } from "./FighterChip"
import { MyCatchesModal } from "./MyCatchesModal"
import { playerLocationAtom } from "./PlayerMarker"
import { TypeBadge } from "./TypeBadge"
import { cn } from "./cn"
import { battleIcon, careIcon, pastIcon, swapIcon } from "./typeIcons"
import { useAttackWildlife } from "./useAttackWildlife"
import { useMyTeam } from "./useMyTeam"
import { useCareCenter } from "./usePlace"
import { useWildlifeToBattle } from "./useWildlife"

export const BattleFastView = () => {
  const { myTeam } = useMyTeam()

  const wildlife = useWildlifeToBattle()

  const { care, isLoading: careIsLoading } = useCare()
  const { careCenterIsClose } = useCareCenter()

  const { attackWildlife, attackWildlifeLoading } = useAttackWildlife()
  const store = useStore()

  return (
    <>
      <div className="flex flex-col pt-6 gap-4 flex-1 ">
        <div className="flex flex-row flex-1 max-h-96 p-1 -mx-4">
          <div className="flex-1 flex flex-col gap-1 overflow-hidden">
            <div className="px-3 font-bold text-xs opacity-60 text-left">
              Your Team
            </div>
            <div className="flex flex-col gap-3 p-2 text-black flex-1 overflow-auto">
              {myTeam?.map((c) => {
                return (
                  <Fragment key={c.wildlife.id}>
                    <FighterChip
                      fighter={c}
                      showAbsoluteHp={true}
                      ltr={true}
                      onClick={() => {
                        NiceModal.show(CatchDetailsModal, {
                          catchId: c.id,
                        })
                      }}
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
              {wildlife?.map((w) => {
                const isRespawning = w.wildlife.respawnsAt > new Date()
                return (
                  <Fragment key={w.wildlife.id}>
                    <FighterChip
                      fighter={w}
                      showAbsoluteHp={false}
                      ltr={false}
                      grayscale={isRespawning}
                      onClick={() => {
                        const playerLocation = store.get(playerLocationAtom)
                        const distance = calcDistanceInMeter(
                          playerLocation,
                          w.wildlife
                        )
                        if (distance > RADIUS_IN_M_CATCH_WILDLIFE) {
                          NiceModal.show(CurrentObservationModal, {
                            wildlifeId: w.wildlife.id,
                          })
                          return
                        }
                        if (attackWildlifeLoading) return
                        attackWildlife({
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
        <div className="flex flex-row gap-2 flex-wrap">
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
            className={cn(
              "flex-1",
              careIsLoading && "opacity-50",
              !careCenterIsClose && "opacity-0"
            )}
            onClick={() => {
              if (!careCenterIsClose) return
              if (careIsLoading) return
              care()
            }}
          />
          <TypeBadge
            icon={battleIcon}
            content={"Auto"}
            size="big"
            className="flex-1"
            onClick={() => {
              NiceModal.show(AutoBattleModal)
            }}
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

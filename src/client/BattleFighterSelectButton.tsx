import NiceModal from "@ebay/nice-modal-react"
import { find, map } from "lodash-es"
import { ArrowLeftRight } from "lucide-react"
import Image from "next/image"
import { Fragment } from "react"
import { MAX_FIGHTERS_PER_TEAM } from "~/config"
import { type BattleReportSide } from "~/server/lib/battle/BattleReport"
import { fillWithNulls } from "~/utils/fillWithNulls"
import { BattleFighterSelectModal } from "./BattleFighterSelectModal"
import { cn } from "./cn"
import { getFighterImage } from "./getFighterImage"
import { useGetWildlifeName } from "./useGetWildlifeName"
import { usePlayer } from "./usePlayer"
import { useShowFighters } from "./useShowFighter"

export const BattleFighterSelectButton = ({
  side,
  isMainSide,
  isMySide,
  battleIsActive,
  battleId,
}: {
  side: BattleReportSide
  isMainSide: boolean
  isMySide: boolean
  battleIsActive: boolean
  battleId: string
}) => {
  const { playerId } = usePlayer()
  const getName = useGetWildlifeName()

  const activeWildlifeIsMoveTrapped = !!find(
    side.fighters,
    (f) => f.fighter.isActive
  )?.fighter?.trappedInMoves

  const onClickDisabled =
    !playerId || !isMySide || !battleIsActive || activeWildlifeIsMoveTrapped

  // makeChoice({
  //   battleId,
  //   playerId: playerId,
  //   choice: `switch ${fighterIdx + 1}`,
  // })

  const showFighters = useShowFighters()

  if (side.fighters.length <= 1) return null
  return (
    <>
      <div
        className={cn(
          "flex gap-1 justify-start items-center",
          isMainSide ? "flex-row" : "flex-row-reverse",
          "rounded px-2 py-1 -mx-2",
          !onClickDisabled && "cursor-pointer hover:bg-gray-100 "
        )}
        onClick={() => {
          if (onClickDisabled) return
          NiceModal.show(BattleFighterSelectModal, {
            fighters: side.fighters,
            battleId,
          })
        }}
      >
        {map(
          fillWithNulls(side.fighters, MAX_FIGHTERS_PER_TEAM),
          (fighter, fighterIdx) => {
            if (!fighter) {
              return (
                <div
                  key={fighterIdx}
                  className={cn(
                    "relative aspect-square w-5 md:w-6 h-5 md:h-6 overflow-hidden rounded-full border-2",
                    "border-gray-100 bg-gray-50"
                  )}
                />
              )
            }

            const { hp, hpMax } = fighter.fighter
            const hpFull = hp >= hpMax
            const dead = hp <= 0

            return (
              <Fragment key={fighterIdx}>
                <button
                  title={getName(fighter)}
                  disabled={!isMySide || activeWildlifeIsMoveTrapped}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-full border-2 w-5 md:w-6 h-5 md:h-6",
                    hpFull
                      ? "border-green-500"
                      : dead
                      ? "border-red-500"
                      : "border-amber-400"
                  )}
                  onClick={onClickDisabled ? undefined : () => {}}
                >
                  {showFighters ? (
                    <>
                      <Image
                        src={getFighterImage({
                          fighterSpeciesNum: fighter.fighter.speciesNum,
                        })}
                        title={
                          activeWildlifeIsMoveTrapped
                            ? "You can not switch while your active wildlife is locked into its move"
                            : undefined
                        }
                        className={cn(
                          "w-full object-cover object-center",
                          activeWildlifeIsMoveTrapped && "grayscale",
                          "bg-gray-200"
                        )}
                        alt={"Observation"}
                        unoptimized
                        width={1}
                        height={1}
                      />
                    </>
                  ) : (
                    <>
                      {fighter.wildlife?.metadata.taxonImageUrlSquare && (
                        <Image
                          title={
                            activeWildlifeIsMoveTrapped
                              ? "You can not switch while your active wildlife is locked into its move"
                              : undefined
                          }
                          src={fighter.wildlife.metadata.taxonImageUrlSquare}
                          className={cn(
                            "w-full object-cover object-center",
                            activeWildlifeIsMoveTrapped && "grayscale"
                          )}
                          alt={"Observation"}
                          unoptimized
                          fill={true}
                        />
                      )}
                    </>
                  )}
                </button>
              </Fragment>
            )
          }
        )}
        {!onClickDisabled && (
          <ArrowLeftRight className="w-4 h-4 text-gray-600" />
        )}
      </div>
    </>
  )
}

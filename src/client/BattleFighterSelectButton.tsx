import { find, map } from "lodash-es"
import Image from "next/image"
import { Fragment } from "react"
import { MAX_FIGHTERS_PER_TEAM } from "~/config"
import { type BattleReportSide } from "~/server/lib/battle/BattleReport"
import { fillWithNulls } from "~/utils/fillWithNulls"
import { cn } from "./cn"
import { useGetWildlifeName } from "./useGetWildlifeName"
import { usePlayer } from "./usePlayer"

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
  if (side.fighters.length <= 1) return null
  return (
    <>
      <div
        className={cn(
          "flex gap-1 justify-start",
          isMainSide ? "flex-row" : "flex-row-reverse"
        )}
      >
        {map(
          fillWithNulls(side.fighters, MAX_FIGHTERS_PER_TEAM),
          (fighter, fighterIdx) => {
            if (!fighter) {
              return (
                <div
                  key={fighterIdx}
                  className={cn(
                    "relative aspect-square w-4 h-4 overflow-hidden rounded-full border-2",
                    "border-gray-100 bg-gray-50"
                  )}
                />
              )
            }

            const { hp, hpMax } = fighter.fighter
            const hpFull = hp >= hpMax
            const dead = hp <= 0
            const activeWildlifeIsMoveTrapped = !!find(
              side.fighters,
              (f) => f.fighter.isActive
            )?.fighter?.trappedInMoves
            const onClickDisabled =
              !playerId ||
              !isMySide ||
              !battleIsActive ||
              activeWildlifeIsMoveTrapped
            return (
              <Fragment key={fighterIdx}>
                <button
                  title={fighter.name || getName(fighter.wildlife)}
                  disabled={!isMySide || activeWildlifeIsMoveTrapped}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-full border-2 w-4 h-4",
                    hpFull
                      ? "border-green-500"
                      : dead
                      ? "border-red-500"
                      : "border-amber-400",
                    isMySide
                      ? onClickDisabled
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                      : "cursor-default"
                  )}
                  onClick={
                    onClickDisabled
                      ? undefined
                      : () => {
                          // makeChoice({
                          //   battleId,
                          //   playerId: playerId,
                          //   choice: `switch ${fighterIdx + 1}`,
                          // })
                        }
                  }
                >
                  {fighter.wildlife.metadata.taxonImageUrlSquare && (
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
                </button>
              </Fragment>
            )
          }
        )}
      </div>
    </>
  )
}

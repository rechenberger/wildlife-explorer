import NiceModal from "@ebay/nice-modal-react"
import { useSetAtom } from "jotai"
import { Edit2 } from "lucide-react"
import dynamic from "next/dynamic"
import { useMemo } from "react"
import { DEV_MODE } from "~/config"
import { type BattleReportFighter } from "~/server/lib/battle/BattleReport"
import { api } from "~/utils/api"
import { calcExpPercentage } from "~/utils/calcExpPercentage"
import { Away } from "./Away"
import { CatchDetailsModal } from "./CatchDetailsModal"
import { currentObservationIdAtom } from "./CurrentObservation"
import { DividerHeading } from "./DividerHeading"
import { FighterChip } from "./FighterChip"
import { FighterMoves } from "./FighterMoves"
import { FighterStatsChart } from "./FighterStatsChart"
import { FighterTypeBadges } from "./FighterTypeBadges"
import { TimeAgo } from "./TimeAgo"
import { Progress } from "./shadcn/ui/progress"
import { useMyCatch } from "./useCatches"
import { useGetWildlifeName } from "./useGetWildlifeName"
import { useMapSetCenter } from "./useMapRef"
import { usePlayer } from "./usePlayer"

const JsonViewer = dynamic(() => import("../client/JsonViewer"), { ssr: false })

export const CatchDetails = ({
  catchId,
  showTitle,
  showDividers,
  showWildlife,
  showTypes,
  showAbility,
  showNature,
  showMoves,
  showExp,
  showStats,
  showCaughtAt,
  fighter,
  buttonSlot,
}: {
  catchId: string
  showTitle?: boolean
  showDividers?: boolean
  showWildlife?: boolean
  showTypes?: boolean
  showAbility?: boolean
  showNature?: boolean
  showMoves?: boolean
  showExp?: boolean
  showStats?: boolean
  showCaughtAt?: boolean
  fighter?: BattleReportFighter
  buttonSlot?: React.ReactNode
}) => {
  const { myCatch } = useMyCatch({ catchId })

  const c = useMemo(
    () =>
      myCatch
        ? {
            ...myCatch,
            ...fighter,
            wildlife: myCatch.wildlife,
          }
        : null,
    [fighter, myCatch]
  )

  const getName = useGetWildlifeName()

  const mapSetCenter = useMapSetCenter()
  const setCurrentObservationId = useSetAtom(currentObservationIdAtom)

  const { playerId } = usePlayer()
  const trpc = api.useContext()
  const { mutate: rename } = api.catch.rename.useMutation({
    onSuccess: () => {
      trpc.catch.invalidate()
    },
  })

  if (!c)
    return (
      <div className="flex items-center justify-center py-12 text-center text-sm opacity-60">
        Loading...
      </div>
    )

  const percentage = calcExpPercentage(c.metadata)

  return (
    <>
      {showTitle && (
        <div className="flex flex-row gap-2">
          <div>{c.name || getName(c.wildlife)}</div>
          <button
            onClick={() => {
              const name = prompt("New Name", c.name || getName(c.wildlife))
              if (!playerId) return
              if (name) {
                rename({
                  catchId: c.id,
                  name,
                  playerId,
                })
              }
            }}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="p-2 flex flex-col gap-4">
        {showWildlife && (
          <>
            {showDividers && <DividerHeading>Wildlife</DividerHeading>}
            <div className="flex flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-[50%]">
                <FighterChip
                  showAbsoluteHp
                  ltr
                  fighter={c}
                  onClick={() => {
                    NiceModal.show(CatchDetailsModal, {
                      catchId: c.id,
                    })
                  }}
                />
              </div>
              {showCaughtAt && (
                <button
                  className="text-right text-xs font-normal text-black opacity-60 inline-block"
                  onClick={() => {
                    setCurrentObservationId(c.wildlife.observationId)
                    mapSetCenter(c.wildlife)
                  }}
                >
                  <div>
                    <span>Caught&nbsp;</span>
                    <Away
                      location={c.wildlife}
                      className="text-xs font-normal text-black inline-block"
                    />
                  </div>
                  <div className="">
                    <TimeAgo date={c.createdAt} addSuffix={true} />
                  </div>
                </button>
              )}
              {buttonSlot}
            </div>
          </>
        )}

        {showTypes && (
          <>
            {showDividers && (
              <DividerHeading>Types, Ability, Nature</DividerHeading>
            )}
            <div className="flex flex-row gap-2 flex-wrap">
              <FighterTypeBadges
                fighter={c}
                showTypes
                showAbility={showAbility}
                showNature={showNature}
                size={"big"}
                className="flex-1"
              />
            </div>
          </>
        )}

        {showMoves && (
          <>
            {showDividers && <DividerHeading>Moves</DividerHeading>}
            <FighterMoves fighter={c} />
          </>
        )}

        {showExp && !!percentage && (
          <>
            {showDividers && <DividerHeading>Experience</DividerHeading>}
            <div className="flex flex-1 items-center text-xs justify-center">
              {percentage?.expAbsolute} / {percentage?.expNextLevelAbsolute}
            </div>
            <Progress className="w-full" value={percentage?.expPercentage} />
          </>
        )}
        {showStats && (
          <>
            <DividerHeading>Stats</DividerHeading>
            <FighterStatsChart fighter={c} />
          </>
        )}
        {showStats && DEV_MODE && (
          <>
            <DividerHeading>JSON</DividerHeading>
            <JsonViewer value={c} collapsed />
          </>
        )}
      </div>
    </>
  )
}

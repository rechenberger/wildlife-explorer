import NiceModal from "@ebay/nice-modal-react"
import { Edit2, ExternalLink, Network } from "lucide-react"
import dynamic from "next/dynamic"
import { useMemo } from "react"
import { DEV_MODE } from "~/config"
import { type BattleReportFighter } from "~/server/lib/battle/BattleReport"
import { api } from "~/utils/api"
import { calcExpPercentage } from "~/utils/calcExpPercentage"
import { Away } from "./Away"
import { CatchDetailsModal } from "./CatchDetailsModal"
import { CurrentObservationModal } from "./CurrentObservationModal"
import { DividerHeading } from "./DividerHeading"
import { FighterChip } from "./FighterChip"
import { FighterMoves } from "./FighterMoves"
import { FighterStatsChart } from "./FighterStatsChart"
import { FighterTypeBadges } from "./FighterTypeBadges"
import { MoveSwapperModal } from "./MoveSwapperModal"
import { TaxonOverviewModal } from "./TaxonOverviewModal"
import { TimeAgo } from "./TimeAgo"
import { TypeBadge } from "./TypeBadge"
import { Progress } from "./shadcn/ui/progress"
import { evolveIcon, swapIcon } from "./typeIcons"
import { useMyCatch } from "./useCatches"
import { useEvolve } from "./useEvolve"
import { useGetWildlifeName } from "./useGetWildlifeName"
import { useMapFlyTo } from "./useMapRef"
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
  canSwapMoves,
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
  canSwapMoves?: boolean
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

  const mapFlyTo = useMapFlyTo()

  const { playerId, player } = usePlayer()
  const trpc = api.useContext()
  const { mutate: rename } = api.catch.rename.useMutation({
    onSuccess: () => {
      trpc.catch.invalidate()
    },
  })
  const { evolve } = useEvolve()

  if (!c)
    return (
      <div className="flex items-center justify-center py-12 text-center text-sm opacity-60">
        Loading...
      </div>
    )

  const percentage = calcExpPercentage(c.metadata)

  const catchName = c.name || getName(c.wildlife)
  return (
    <>
      {showTitle && (
        <div className="flex flex-row gap-2">
          <div>{catchName}</div>
          <button
            onClick={() => {
              const name = prompt("New Name", catchName)
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
            <div className="flex flex-row gap-2 items-center justify-between">
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
              <>
                <button
                  className="text-right text-xs font-normal text-black opacity-60 flex flex-col items-center hover:bg-gray-200 rounded-lg p-2"
                  onClick={() => {
                    NiceModal.show(TaxonOverviewModal, {
                      taxonId: c.wildlife.taxonId,
                    })
                  }}
                >
                  <Network className="w-4 h-4" />
                  <div>Taxon</div>
                </button>
              </>
              {showCaughtAt && (
                <button
                  className="text-right text-xs font-normal text-black opacity-60 inline-block hover:bg-gray-200 rounded-lg p-2"
                  onClick={() => {
                    NiceModal.show(CurrentObservationModal, {
                      wildlifeId: c.wildlifeId,
                    })
                    mapFlyTo({ center: c.wildlife })
                  }}
                >
                  <div className="flex flex-row gap-1">
                    <div className="flex-1">Caught</div>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div>
                    {/* <span>Caught&nbsp;</span> */}
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

        {c.fighter?.canEvolve && !player?.metadata?.activeBattleId && (
          <>
            <TypeBadge
              content="Evolve"
              icon={evolveIcon}
              size="big"
              onClick={() => {
                evolve({ catchId: c.id, catchName })
              }}
              className="animate-pulse"
            />
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
            {canSwapMoves && !player?.metadata?.activeBattleId && (
              <div className="flex flex-row-reverse">
                <TypeBadge
                  icon={swapIcon}
                  content={"Swap Moves"}
                  size="big"
                  className="w-1/2"
                  onClick={() => {
                    NiceModal.show(MoveSwapperModal, {
                      catchId: c.id,
                    })
                  }}
                />
              </div>
            )}
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

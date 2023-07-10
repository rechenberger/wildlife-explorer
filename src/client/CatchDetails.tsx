import { useSetAtom } from "jotai"
import { Away } from "./Away"
import { currentObservationIdAtom } from "./CurrentObservation"
import { DividerHeading } from "./DividerHeading"
import { FighterChip } from "./FighterChip"
import { FighterMoves } from "./FighterMoves"
import { FighterStatsChart } from "./FighterStatsChart"
import { FighterTypeBadges } from "./FighterTypeBadges"
import { TimeAgo } from "./TimeAgo"
import { useMyCatch } from "./useCatches"
import { useGetWildlifeName } from "./useGetWildlifeName"
import { useMapSetCenter } from "./useMapRef"

export const CatchDetails = ({ catchId }: { catchId: string }) => {
  const { myCatch: c } = useMyCatch({ catchId })

  const getName = useGetWildlifeName()

  const mapSetCenter = useMapSetCenter()
  const setCurrentObservationId = useSetAtom(currentObservationIdAtom)

  if (!c)
    return (
      <div className="flex items-center justify-center py-12 text-center text-sm opacity-60">
        Loading...
      </div>
    )

  return (
    <>
      <div>{getName(c.wildlife)}</div>
      <div className="p-2 flex flex-col gap-4">
        <div className="flex flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-[50%]">
            <FighterChip showAbsoluteHp ltr fighter={c} />
          </div>
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
        </div>

        <DividerHeading>Types, Ability, Nature</DividerHeading>
        <div className="flex flex-row gap-2">
          <FighterTypeBadges
            fighter={c}
            showTypes
            showAbility
            showNature
            size={"big"}
            className="flex-1"
          />
        </div>

        <DividerHeading>Moves</DividerHeading>
        <FighterMoves fighter={c} />

        <DividerHeading>Stats</DividerHeading>
        <FighterStatsChart fighter={c} />
      </div>
    </>
  )
}

import { Away } from "./Away"
import { FighterChip } from "./FighterChip"
import { FighterMoves } from "./FighterMoves"
import { FighterStatsChart } from "./FighterStatsChart"
import { FighterTypeBadges } from "./FighterTypeBadges"
import { TimeAgo } from "./TimeAgo"
import { useMyCatch } from "./useCatches"
import { useGetWildlifeName } from "./useGetWildlifeName"

export const CatchDetails = ({ catchId }: { catchId: string }) => {
  const { myCatch: c } = useMyCatch({ catchId })

  const getName = useGetWildlifeName()

  // const mapSetCenter = useMapSetCenter()
  // const setCurrentObservationId = useSetAtom(currentObservationIdAtom)

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
        <div className="flex flex-row gap-2 items-center text-xs font-bold opacity-60 mt-4">
          <hr className="flex-1 border-black/60" />
          <div>Wildlife</div>
          <hr className="flex-1 border-black/60" />
        </div>
        <div className="flex flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-[50%]">
            <FighterChip showAbsoluteHp ltr fighter={c} />
          </div>
          <div
            className="text-right text-xs font-normal text-black opacity-60 inline-block"
            // onClick={() => {
            //   setCurrentObservationId(c.wildlife.observationId)
            //   mapSetCenter(c.wildlife)
            // }}
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
          </div>
        </div>

        <div className="flex flex-row gap-2 items-center text-xs font-bold opacity-60 mt-4">
          <hr className="flex-1 border-black/60" />
          <div>Types, Ability, Nature</div>
          <hr className="flex-1 border-black/60" />
        </div>
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

        <div className="flex flex-row gap-2 items-center text-xs font-bold opacity-60 mt-4">
          <hr className="flex-1 border-black/60" />
          <div>Moves</div>
          <hr className="flex-1 border-black/60" />
        </div>
        <FighterMoves fighter={c} />

        <div className="flex flex-row gap-2 items-center text-xs font-bold opacity-60 mt-4">
          <hr className="flex-1 border-black/60" />
          <div>Stats</div>
          <hr className="flex-1 border-black/60" />
        </div>
        <FighterStatsChart fighter={c} />
      </div>
    </>
  )
}

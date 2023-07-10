import { FighterChip } from "./FighterChip"
import { FighterMoves } from "./FighterMoves"
import { FighterStatsChart } from "./FighterStatsChart"
import { FighterTypeBadges } from "./FighterTypeBadges"
import { useMyCatch } from "./useCatches"
import { useGetWildlifeName } from "./useGetWildlifeName"

export const CatchDetails = ({ catchId }: { catchId: string }) => {
  const { myCatch: c } = useMyCatch({ catchId })

  const getName = useGetWildlifeName()

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
        <div className="w-1/2">
          <FighterChip showAbsoluteHp ltr fighter={c} />
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

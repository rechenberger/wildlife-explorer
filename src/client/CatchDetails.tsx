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
        <FighterChip showAbsoluteHp ltr fighter={c} />
        <div className="flex flex-row gap-2">
          <FighterTypeBadges fighter={c} showTypes showAbility showNature />
        </div>
        <FighterMoves fighter={c} />
        <FighterStatsChart />
      </div>
    </>
  )
}

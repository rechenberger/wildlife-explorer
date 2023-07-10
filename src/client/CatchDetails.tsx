import { FighterChip } from "./FighterChip"
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
      <div className="p-2">
        <FighterChip showAbsoluteHp ltr fighter={c} />
      </div>
    </>
  )
}

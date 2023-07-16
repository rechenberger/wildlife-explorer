import { groupBy, map } from "lodash-es"
import dynamic from "next/dynamic"
import { Fragment, useMemo } from "react"
import { api } from "~/utils/api"
import { CatchDetails } from "./CatchDetails"
import { DividerHeading } from "./DividerHeading"
import { FighterMove } from "./FighterMoves"
import { useMyCatch } from "./useCatches"
import { usePlayer } from "./usePlayer"

const JsonViewer = dynamic(() => import("../client/JsonViewer"), { ssr: false })
const SHOW_JSON = false

export const MoveSwapper = ({ catchId }: { catchId: string }) => {
  const { myCatch: c } = useMyCatch({ catchId })
  const { playerId } = usePlayer()
  const { data: allMoves } = api.move.getPossibleMoves.useQuery(
    { playerId: playerId!, catchId },
    { enabled: !!playerId }
  )
  const { active, learned, future } = useMemo(() => {
    return groupBy(allMoves, (move) => {
      if (typeof move.activeIdx === "number") return "active"
      if (move.learned) return "learned"
      return "future"
    })
  }, [allMoves])

  if (!c) return null

  return (
    <div className="flex flex-col gap-4">
      <div>Edit Moves</div>
      <CatchDetails catchId={catchId} showWildlife showDividers />
      <DividerHeading>Active Moves</DividerHeading>
      <div className="grid flex-1 grid-cols-1 gap-1">
        {map(active, (move) => {
          return (
            <Fragment key={move.id}>
              <FighterMove fighter={c} move={move} />
            </Fragment>
          )
        })}
      </div>
      <DividerHeading>Learned Moves</DividerHeading>
      <div className="grid flex-1 grid-cols-1 gap-1">
        {map(learned, (move) => {
          return (
            <Fragment key={move.id}>
              <FighterMove fighter={c} move={move} />
            </Fragment>
          )
        })}
      </div>
      <DividerHeading>Future Moves</DividerHeading>
      <div className="grid flex-1 grid-cols-[auto_1fr] gap-1 items-center gap-x-2">
        {map(future, (move) => {
          return (
            <Fragment key={move.id}>
              <div className="text-gray-500 text-sm">
                Level {move.learnAtLevel}
              </div>
              <FighterMove fighter={c} move={move} />
            </Fragment>
          )
        })}
      </div>
      {SHOW_JSON && (
        <>
          <DividerHeading>JSON</DividerHeading>
          <JsonViewer value={allMoves} collapsed={true} />
        </>
      )}
    </div>
  )
}

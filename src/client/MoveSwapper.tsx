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

export const MoveSwapper = ({ catchId }: { catchId: string }) => {
  const { myCatch: c } = useMyCatch({ catchId })
  const { playerId } = usePlayer()
  const { data: allMoves } = api.move.getPossibleMoves.useQuery(
    { playerId: playerId!, catchId },
    { enabled: !!playerId }
  )
  const { active, learned, future } = useMemo(() => {
    return groupBy(allMoves, (move) => {
      if (move.activeIdx) return "active"
      if (move.learned) return "learned"
      return "future"
    })
  }, [allMoves])

  if (!c) return null

  return (
    <>
      <div>Edit Moves</div>
      <CatchDetails catchId={catchId} showWildlife showDividers />
      <DividerHeading>Active Moves</DividerHeading>
      <div className="">
        {map(active, (move) => {
          return (
            <Fragment key={move.id}>
              <FighterMove fighter={c} move={move} />
            </Fragment>
          )
        })}
      </div>
      <DividerHeading>Learned Moves</DividerHeading>
      <div className=""></div>
      <DividerHeading>Future Moves</DividerHeading>
      <div className=""></div>
      <DividerHeading>JSON</DividerHeading>
      <JsonViewer value={allMoves} />
    </>
  )
}

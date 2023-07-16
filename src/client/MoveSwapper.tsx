import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers"
import { groupBy, map } from "lodash-es"
import dynamic from "next/dynamic"
import { Fragment, useMemo } from "react"
import { toast } from "sonner"
import { api } from "~/utils/api"
import { CatchDetails } from "./CatchDetails"
import { DividerHeading } from "./DividerHeading"
import { FighterMove, FighterMoveProps } from "./FighterMoves"
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

  const swapInMove = ({
    moveId,
    slotIdx,
  }: {
    moveId: string
    slotIdx: number
  }) => {
    toast(`Swapping Move ${moveId} into Slot ${slotIdx + 1}`)
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  if (!c || !allMoves)
    return (
      <div className="flex items-center justify-center py-12 text-center text-sm opacity-60">
        Loading...
      </div>
    )

  return (
    <div className="flex flex-col gap-4">
      <div>Swap Moves</div>
      <CatchDetails catchId={catchId} showWildlife showDividers />
      <DndContext
        onDragEnd={console.log}
        sensors={sensors}
        modifiers={[restrictToFirstScrollableAncestor]}
      >
        <>
          <DividerHeading>Active Moves</DividerHeading>
          <div className="grid flex-1 grid-cols-1 gap-1">
            {map(active, (move) => {
              return (
                <Fragment key={move.id}>
                  <DraggableMove fighter={c} move={move} />
                </Fragment>
              )
            })}
          </div>
        </>
        {!!learned?.length && (
          <>
            <DividerHeading>Learned Moves</DividerHeading>
            <div className="grid flex-1 grid-cols-1 gap-1">
              {map(learned, (move) => {
                return (
                  <Fragment key={move.id}>
                    <DraggableMove fighter={c} move={move} />
                  </Fragment>
                )
              })}
            </div>
          </>
        )}
      </DndContext>
      {!!future?.length && (
        <>
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
        </>
      )}
      {SHOW_JSON && (
        <>
          <DividerHeading>JSON</DividerHeading>
          <JsonViewer value={allMoves} collapsed={true} />
        </>
      )}
    </div>
  )
}

const DraggableMove = (props: FighterMoveProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.move!.id!,
    // data: {
    //   type,
    // },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <>
      <div
        {...attributes}
        {...listeners}
        style={style}
        ref={setNodeRef}
        className="flex flex-col"
      >
        <FighterMove {...props} />
      </div>
    </>
  )
}

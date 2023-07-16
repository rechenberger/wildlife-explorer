import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers"
import { groupBy, map } from "lodash-es"
import { RotateCcw } from "lucide-react"
import dynamic from "next/dynamic"
import { Fragment, useMemo, type PropsWithChildren } from "react"
import { toast } from "sonner"
import { MAX_MOVES_PER_FIGHTER } from "~/config"
import { api } from "~/utils/api"
import { fillWithNulls } from "~/utils/fillWithNulls"
import { CatchDetails } from "./CatchDetails"
import { DividerHeading } from "./DividerHeading"
import { FighterMove, type FighterMoveProps } from "./FighterMoves"
import { cn } from "./cn"
import { Button } from "./shadcn/ui/button"
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
  const trpc = api.useContext()
  const { mutateAsync: swap } = api.move.swap.useMutation({
    onSuccess: () => {
      trpc.move.invalidate()
      trpc.catch.invalidate()
    },
  })
  const { mutate: reset } = api.move.reset.useMutation({
    onSuccess: () => {
      trpc.move.invalidate()
      trpc.catch.invalidate()
    },
  })

  const { active, learned, future } = useMemo(() => {
    return groupBy(allMoves, (move) => {
      if (typeof move.activeIdx === "number") return "active"
      if (move.learned) return "learned"
      return "future"
    })
  }, [allMoves])

  const swapInMove = ({
    newMoveId,
    oldMoveId,
  }: {
    newMoveId: string
    oldMoveId?: string
  }) => {
    if (!playerId) return
    toast.promise(
      swap({
        catchId,
        playerId,
        newMoveId,
        oldMoveId,
      }),
      {
        loading: "Swapping Move...",
        success: "Move Swapped!",
        error: (err) => err.message || "Error Swapping Move",
      }
    )
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
      <CatchDetails
        catchId={catchId}
        showWildlife
        showDividers
        buttonSlot={
          <>
            {c.metadata.moves ? (
              <Button
                onClick={() => {
                  if (!playerId) return
                  if (
                    !confirm(
                      "Are you sure you want to reset all moves to default? The latest learned moves will be active and auto-swapped on when learning new moves. You will still know your learned moves."
                    )
                  ) {
                    return
                  }
                  reset({
                    catchId,
                    playerId,
                  })
                }}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                <div className="text-xs">Reset Moves</div>
              </Button>
            ) : (
              <div className="text-xs text-gray-400 flex-1">
                Try dragging a learned move over an active move to swap them.
              </div>
            )}
          </>
        }
      />
      <DndContext
        onDragEnd={(e) => {
          const newMoveId = e.active.id.toString()
          const oldMoveId = e.over?.id.toString()
          if (!newMoveId || !oldMoveId) return
          swapInMove({
            newMoveId,
            oldMoveId: oldMoveId === "empty" ? undefined : oldMoveId,
          })
        }}
        sensors={sensors}
        modifiers={[restrictToFirstScrollableAncestor]}
      >
        <>
          <DividerHeading>Active Moves</DividerHeading>
          <div className="grid flex-1 grid-cols-1 gap-1">
            {map(
              fillWithNulls(active || [], MAX_MOVES_PER_FIGHTER),
              (move, idx) => {
                return (
                  <Fragment key={move?.id || idx}>
                    <DroppableMoveSlot id={move?.id || "empty"}>
                      {move ? (
                        <DraggableMove fighter={c} move={move} />
                      ) : (
                        <FighterMove fighter={c} move={null} />
                      )}
                    </DroppableMoveSlot>
                  </Fragment>
                )
              }
            )}
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

const DroppableMoveSlot = ({
  children,
  id,
}: PropsWithChildren<{ id: string }>) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div ref={setNodeRef} className={cn("", isOver && "opacity-10")}>
      {children}
    </div>
  )
}

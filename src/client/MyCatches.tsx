import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers"
import { map } from "lodash-es"
import { z } from "zod"
import { MAX_FIGHTERS_PER_TEAM } from "~/config"
import { api } from "~/utils/api"
import { fillWithNulls } from "~/utils/fillWithNulls"
import { DividerHeading } from "./DividerHeading"
import { DraggableCatch } from "./DraggableCatch"
import { DroppableTeamSlot } from "./DroppableTeamSlot"
import { cn } from "./cn"
import { useMyTeam } from "./useMyTeam"
import { usePlayer } from "./usePlayer"

export const MyCatches = () => {
  const { playerId } = usePlayer()

  const { myTeam, catchesWithoutTeam, isLoading, isFetching } = useMyTeam()

  const trpc = api.useContext()

  const { mutate: setMyTeamBattleOrder, isLoading: isMutating } =
    api.catch.setMyTeamBattleOrder.useMutation({
      onSuccess: () => {
        trpc.catch.getMyCatches.invalidate()
      },
    })

  const disabled = isMutating || isFetching

  const isDefaultSwap = true

  const addToTeamAtPos = ({
    position,
    catchId,
    isSwapWithCurrentPosition = isDefaultSwap,
  }: {
    position: number
    catchId: string
    isSwapWithCurrentPosition?: boolean
  }) => {
    if (disabled) return
    if (!playerId) return
    const currentTeamOrder = myTeam.map((c) => c.id)

    let newTeamOrder: string[] = []

    if (isSwapWithCurrentPosition) {
      const catchIdAtPos = currentTeamOrder[position]
      if (!catchIdAtPos) {
        newTeamOrder = [...currentTeamOrder, catchId]
      } else {
        const catchIdIsAlreadyInTeam = myTeam.some((c) => c.id === catchId)

        newTeamOrder = [...currentTeamOrder]
        newTeamOrder[position] = catchId

        if (catchIdIsAlreadyInTeam) {
          newTeamOrder[currentTeamOrder.indexOf(catchId)] = catchIdAtPos
        }
      }
    } else {
      const currentTeamWithoutCatchId = currentTeamOrder.filter(
        (cId) => cId !== catchId
      )
      newTeamOrder = [
        ...currentTeamWithoutCatchId.slice(0, position),
        catchId,
        ...currentTeamWithoutCatchId.slice(position),
      ]
    }

    setMyTeamBattleOrder({
      catchIds: newTeamOrder,
      playerId,
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (disabled) return
    const { active, over } = event

    if (!active || !over) return

    const activeId = z.string().parse(active.id)
    const overId = z.number().parse(over.id)

    if (!activeId) return

    addToTeamAtPos({
      position: overId,
      catchId: activeId,
    })
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-center text-sm opacity-60">
        Loading...
      </div>
    )
  }

  if (!myTeam.length && !catchesWithoutTeam.length) {
    catchesWithoutTeam.length === 0 && (
      <div className="flex items-center justify-center py-12 text-center text-sm opacity-60">
        Catch some Wildlife and your team will appear here.
      </div>
    )
  }

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      sensors={sensors}
      modifiers={[restrictToFirstScrollableAncestor]}
    >
      <DividerHeading>Your Team</DividerHeading>

      <div
        className={cn(
          "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 gap-y-3 p-2 items-center"
        )}
      >
        {map(fillWithNulls(myTeam, MAX_FIGHTERS_PER_TEAM), (c, idx) => (
          <DroppableTeamSlot id={idx} key={c?.id ?? idx}>
            {c ? (
              <DraggableCatch c={c} disabled={disabled} />
            ) : (
              <div className="bg-gray-100 h-12 rounded-3xl flex items-center justify-center text-xs text-black/60">
                Slot #{idx + 1}
              </div>
            )}
          </DroppableTeamSlot>
        ))}
      </div>
      <DividerHeading>Your Catches</DividerHeading>
      {!catchesWithoutTeam.length && (
        <div className="flex items-center justify-center py-12 text-center text-sm opacity-60">
          Once you have more than {MAX_FIGHTERS_PER_TEAM} catches. New catches
          will be added here.
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 gap-y-3 p-2">
        {map(catchesWithoutTeam, (c) => (
          <DraggableCatch c={c} key={c.id} />
        ))}
      </div>
    </DndContext>
  )
}

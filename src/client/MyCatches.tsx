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

  const { myTeam, catchesWithoutTeam, isLoading } = useMyTeam()

  const trpc = api.useContext()

  const { mutate: setMyTeamBattleOrder } =
    api.catch.setMyTeamBattleOrder.useMutation({
      onSuccess: () => {
        trpc.catch.getMyCatches.invalidate()
      },
    })

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
    console.log({ event })

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
              <DraggableCatch c={c} />
            ) : (
              <div className="bg-gray-100 h-12 rounded-3xl flex items-center justify-center text-xs text-black/60">
                Slot #{idx + 1}
              </div>
            )}
          </DroppableTeamSlot>
        ))}
      </div>
      <DividerHeading>Your Catches</DividerHeading>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 gap-y-3 p-2">
        {map(catchesWithoutTeam, (c) => (
          <DraggableCatch c={c} key={c.id} />
        ))}
      </div>
    </DndContext>
  )
}

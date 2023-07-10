import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { map } from "lodash-es"
import { api } from "~/utils/api"
import { cn } from "./cn"
import { DoppableTeamSlot } from "./doppableTeamSlot"
import { DraggableCatch } from "./draggableCatch"
import { useMyTeam } from "./useMyTeam"
import { usePlayer } from "./usePlayer"

export const MyCatches = () => {
  const { playerId } = usePlayer()

  const { myTeam, catchesWithoutTeam } = useMyTeam()

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
      teamIds: newTeamOrder,
      playerId,
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    console.log({ event })

    const { active, over } = event

    if (!active || !over) return

    const activeId = active.id as string
    const overId = over.id as number

    if (!activeId || typeof overId !== "number") return

    addToTeamAtPos({
      position: overId,
      catchId: activeId,
    })
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="mb-4">Your Team</div>
      <div
        className={cn(
          "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 gap-y-3 p-2"
        )}
      >
        {map(myTeam, (c, idx) => (
          <DoppableTeamSlot id={idx} key={c.id}>
            <DraggableCatch c={c} />
          </DoppableTeamSlot>
        ))}
      </div>
      <div className="mb-4">Your Catches</div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 gap-y-3 p-2">
        {map(catchesWithoutTeam, (c) => (
          <DraggableCatch c={c} key={c.id} />
        ))}
      </div>
    </DndContext>
  )
}

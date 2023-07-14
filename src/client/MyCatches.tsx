import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers"
import { includes, map, orderBy } from "lodash-es"
import { ArrowDown, ArrowUp } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { MAX_FIGHTERS_PER_TEAM } from "~/config"
import { api } from "~/utils/api"
import { fillWithNulls } from "~/utils/fillWithNulls"
import { DividerHeading } from "./DividerHeading"
import { DraggableCatch } from "./DraggableCatch"
import { DroppableTeamSlot } from "./DroppableTeamSlot"
import { cn } from "./cn"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./shadcn/ui/select"
import { useGetWildlifeName } from "./useGetWildlifeName"
import { useMyTeam } from "./useMyTeam"
import { usePlayer } from "./usePlayer"

export const MyCatches = () => {
  const { playerId } = usePlayer()

  const getName = useGetWildlifeName()

  const { myTeam, catchesWithoutTeam, isLoading, isFetching } = useMyTeam()

  const [orderCatchesBy, setOrderCatchesBy] = useState<string>("caughtAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const trpc = api.useContext()

  const { mutate: setMyTeamBattleOrder, isLoading: isMutating } =
    api.catch.setMyTeamBattleOrder.useMutation({
      onSuccess: () => {
        trpc.catch.getMyCatches.invalidate()
      },
    })

  const disabled = isMutating || isFetching

  const isDefaultSwap = true

  const removeFromTeam = ({ catchId }: { catchId: string }) => {
    if (disabled) return
    if (!playerId) return
    const teamWithoutCatchId = myTeam
      .map((c) => c.id)
      .filter((cId) => cId !== catchId)

    setMyTeamBattleOrder({
      catchIds: teamWithoutCatchId,
      playerId,
    })
  }
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
    // console.log({ event })
    const { active, over } = event

    const acceptsTypes = over?.data?.current?.accepts
    const dropType = active?.data?.current?.type
    if (!!acceptsTypes && !includes(acceptsTypes, dropType)) {
      // console.info("wrong type")
      return
    }
    if (disabled) {
      toast.error("That was too fast, please try again.")
      return
    }

    if (!active || !over) return

    const activeId = z.string().parse(active.id)
    const overId = z.number().parse(over.id)

    if (!activeId) return
    if (overId === -1) {
      removeFromTeam({
        catchId: activeId,
      })
    } else {
      addToTeamAtPos({
        position: overId,
        catchId: activeId,
      })
    }
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
              <DraggableCatch c={c} type="team" />
            ) : (
              <div className="bg-gray-100 h-12 rounded-3xl flex items-center justify-center text-xs text-black/60">
                Slot #{idx + 1}
              </div>
            )}
          </DroppableTeamSlot>
        ))}
      </div>
      <DividerHeading>Your Catches</DividerHeading>
      <div className="px-2 flex-1 flex items-center gap-2 justify-end">
        <div
          className="cursor-pointer"
          onClick={() => {
            setSortOrder(sortOrder === "desc" ? "asc" : "desc")
          }}
        >
          {sortOrder === "desc" ? (
            <ArrowDown className="w-4 h-4" />
          ) : (
            <ArrowUp className="w-4 h-4" />
          )}
        </div>
        <div className="w-28">
          <Select
            onValueChange={(v) => setOrderCatchesBy(v)}
            defaultValue={orderCatchesBy}
          >
            <SelectTrigger className="p-1 border-0 border-b-2 rounded-none h-8">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="caughtAt">Caught At</SelectItem>
              <SelectItem value="level">Level</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {!catchesWithoutTeam.length && (
        <div className="flex items-center justify-center py-12 text-center text-sm opacity-60">
          Once you have more than {MAX_FIGHTERS_PER_TEAM} catches. New catches
          will be added here.
        </div>
      )}
      <DroppableTeamSlot id={-1} accepts={["team"]}>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 gap-y-3 p-2">
          {map(
            orderBy(
              catchesWithoutTeam,
              [
                (c) => {
                  if (orderCatchesBy === "name") {
                    return c.name || getName(c.wildlife)
                  }
                  if (orderCatchesBy === "level") {
                    return c.metadata.level
                  }
                  if (orderCatchesBy === "caughtAt") {
                    return c.createdAt
                  }
                  return c.id
                },
                (c) => c.name || getName(c.wildlife),
              ],
              [sortOrder, "asc"]
            ),
            (c) => (
              <DraggableCatch c={c} key={c.id} type="bench" />
            )
          )}
        </div>
      </DroppableTeamSlot>
    </DndContext>
  )
}

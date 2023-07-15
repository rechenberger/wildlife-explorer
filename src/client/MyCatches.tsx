import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers"
import { useAtom } from "jotai"
import { includes, map, orderBy } from "lodash-es"
import { SortDesc } from "lucide-react"
import { useMemo } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { MAX_FIGHTERS_PER_TEAM } from "~/config"
import { api } from "~/utils/api"
import { atomWithLocalStorage } from "~/utils/atomWithLocalStorage"
import { fillWithNulls } from "~/utils/fillWithNulls"
import { DividerHeading } from "./DividerHeading"
import { DraggableCatch } from "./DraggableCatch"
import { DroppableTeamSlot } from "./DroppableTeamSlot"
import { cn } from "./cn"
import { Input } from "./shadcn/ui/input"
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

const orderOptions = [
  {
    label: "Latest Caught",
    by: "caughtAt",
    direction: "desc",
  },
  {
    label: "Oldest Caught",
    by: "caughtAt",
    direction: "asc",
  },
  {
    label: "Highest Level",
    by: "level",
    direction: "desc",
  },
  {
    label: "Lowest Level",
    by: "level",
    direction: "asc",
  },
  {
    label: "A-Z",
    by: "name",
    direction: "asc",
  },
] as const

const orderIdxAtom = atomWithLocalStorage<number>("catchOverview-orderIdx", 0)
const searchAtom = atomWithLocalStorage<string>("catchOverview-search", "")

export const MyCatches = () => {
  const { playerId } = usePlayer()

  const getName = useGetWildlifeName()

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

  const [orderIdx, setOrderIdx] = useAtom(orderIdxAtom)
  const order = orderOptions[orderIdx] || orderOptions[0]!
  const ordered = useMemo(
    () =>
      orderBy(
        catchesWithoutTeam,
        [
          (c) => {
            if (order.by === "name") {
              return c.name || getName(c.wildlife)
            }
            if (order.by === "level") {
              return c.metadata.level
            }
            if (order.by === "caughtAt") {
              return c.createdAt
            }
            return c.id
          },
          (c) => c.name || getName(c.wildlife),
        ],
        [order.direction, "asc"]
      ),
    [catchesWithoutTeam, getName, order.by, order.direction]
  )

  const [search, setSearch] = useAtom(searchAtom)
  const searched = useMemo(
    () =>
      ordered.filter((c) => {
        if (!search) return true
        const fields = [
          c.name,
          c.metadata.level?.toString(),
          c.wildlife.metadata.taxonName,
          c.wildlife.metadata.taxonCommonName,
          c.wildlife.metadata.taxonLocaleNames?.["de"],
          c.wildlife.metadata.taxonLocaleNames?.["en"],
          c.fighter.ability,
          c.fighter.nature,
          c.fighter.species,
          c.fighter.speciesNum,
          ...c.fighter.types,
          ...c.fighter.moves.map((m) => m.name),
        ]
        const searchWords = search.toLowerCase().split(" ")
        return searchWords.every((word) =>
          fields.some((field) => field?.toString().toLowerCase().includes(word))
        )
      }),
    [ordered, search]
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
      <div className="pt-1 pl-2 pr-4 flex-1 flex items-center gap-2 justify-end">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="rounded-full max-w-xs"
        />
        <div className="flex-1" />
        <div>
          <Select
            onValueChange={(v) => setOrderIdx(parseInt(v))}
            defaultValue={orderIdx.toString()}
          >
            <SelectTrigger className="flex flex-row gap-1 text-xs">
              <SortDesc className="w-4 h-4 opacity-60" />
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {orderOptions.map((o, idx) => (
                <SelectItem key={idx} value={idx.toString()}>
                  {o.label}
                </SelectItem>
              ))}
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
          {map(searched, (c) => (
            <DraggableCatch c={c} key={c.id} type="bench" />
          ))}
        </div>
      </DroppableTeamSlot>
    </DndContext>
  )
}

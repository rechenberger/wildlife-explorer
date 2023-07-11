import { useDroppable } from "@dnd-kit/core"
import { type PropsWithChildren } from "react"
import { cn } from "./cn"

export const DroppableTeamSlot = ({
  children,
  id,
  accepts,
}: PropsWithChildren<{ id: number; accepts?: string[] }>) => {
  const { isOver, setNodeRef, active } = useDroppable({
    id,
    data: {
      accepts,
    },
  })

  const isValidIsOver =
    isOver && (!accepts || accepts?.includes(active?.data?.current?.type))
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-transform -my-1 -ml-2 py-1 pl-2 rounded-3xl",
        isValidIsOver && "bg-gray-100"
      )}
    >
      {children}
    </div>
  )
}

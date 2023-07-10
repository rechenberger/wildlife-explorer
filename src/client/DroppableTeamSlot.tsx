import { useDroppable } from "@dnd-kit/core"
import { type PropsWithChildren } from "react"
import { cn } from "./cn"

export const DroppableTeamSlot = ({
  children,
  id,
}: PropsWithChildren<{ id: number }>) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-transform -my-1 -ml-2 py-1 pl-2 rounded-3xl",
        isOver && "bg-gray-200"
      )}
    >
      {children}
    </div>
  )
}

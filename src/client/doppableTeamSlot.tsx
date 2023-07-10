import { useDroppable } from "@dnd-kit/core"
import { type PropsWithChildren } from "react"
import { cn } from "./cn"

export const DoppableTeamSlot = ({
  children,
  id,
}: PropsWithChildren<{ id: number }>) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn("bg-gray-200", isOver && "bg-green-500")}
    >
      {children}
    </div>
  )
}

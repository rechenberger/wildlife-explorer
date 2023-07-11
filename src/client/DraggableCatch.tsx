import { useDraggable } from "@dnd-kit/core"
import NiceModal from "@ebay/nice-modal-react"
import { CatchDetails } from "./CatchDetails"
import { CatchDetailsModal } from "./CatchDetailsModal"
import { FighterChip } from "./FighterChip"
import { cn } from "./cn"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./shadcn/ui/hover-card"
import { type MyCatch } from "./useCatches"

export const DraggableCatch = ({
  c,
  disabled,
}: {
  c: MyCatch
  disabled?: boolean
}) => {
  const {
    attributes,
    listeners,
    setNodeRef: setNodeRefDrag,
    transform,
    isDragging,
  } = useDraggable({
    id: c.id,
    disabled,
  })
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  if (!c) return null
  return (
    <>
      <div
        style={style}
        {...listeners}
        {...attributes}
        ref={setNodeRefDrag}
        key={c.id}
        className={cn(
          "flex flex-col p-1 touch-manipulation cursor-grab",
          isDragging && "z-30 cursor-grabbing"
        )}
        onClick={() => {
          NiceModal.show(CatchDetailsModal, {
            catchId: c.id,
          })
        }}
      >
        <HoverCard>
          <HoverCardTrigger>
            <FighterChip showAbsoluteHp ltr grayscale={false} fighter={c} />
          </HoverCardTrigger>
          {!isDragging && (
            <HoverCardContent className="w-80">
              <CatchDetails catchId={c.id} tiny />
            </HoverCardContent>
          )}
        </HoverCard>
      </div>
    </>
  )
}

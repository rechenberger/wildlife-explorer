import { useDraggable } from "@dnd-kit/core"
import NiceModal from "@ebay/nice-modal-react"
import { CatchDetailsModal } from "./CatchDetailsModal"
import { FighterChip } from "./FighterChip"
import { type MyCatch } from "./useCatches"

export const DraggableCatch = ({ c }: { c: MyCatch }) => {
  const {
    attributes,
    listeners,
    setNodeRef: setNodeRefDrag,
    transform,
  } = useDraggable({
    id: c?.id || "0",
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
        className="flex cursor-pointer flex-col p-1"
        onClick={(e) => {
          if (e.shiftKey) {
            NiceModal.show(CatchDetailsModal, {
              catchId: c.id,
            })
            return
          }
          // const newPos = parseInt(prompt("Enter new position") as string)
          // addToTeamAtPos({
          //   position: newPos,
          //   catchId: c.id,
          // })
        }}
      >
        <FighterChip showAbsoluteHp ltr grayscale={false} fighter={c} />
      </div>
    </>
  )
}

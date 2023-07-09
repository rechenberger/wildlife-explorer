import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { BattleView } from "./BattleView"
import { Dialog, DialogContent } from "./shadcn/ui/dialog"

export const BattleViewModal = NiceModal.create<{}>(({}) => {
  // Use a hook to manage the modal state
  const modal = useModal()

  return (
    <Dialog
      open={modal.visible}
      onOpenChange={(open) => {
        if (!open) {
          modal.reject()
          modal.remove()
        }
      }}
    >
      <DialogContent className="h-[100svh] sm:h-[70svh] sm:max-w-4xl">
        <BattleView />
      </DialogContent>
    </Dialog>
  )
})

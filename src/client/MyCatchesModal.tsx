import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { MyCatches } from "./MyCatches"
import { cn } from "./cn"
import { Dialog, DialogContent } from "./shadcn/ui/dialog"
import { ScrollArea } from "./shadcn/ui/scroll-area"

export const MyCatchesModal = NiceModal.create<{}>(({}) => {
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
      <DialogContent
        className={cn(
          "border-0 bg-white pt-3",
          "rounded-t-lg max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:p-4 max-sm:pt-3"
        )}
      >
        <ScrollArea className="max-h-[calc(100svh-100px)]">
          <MyCatches />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
})

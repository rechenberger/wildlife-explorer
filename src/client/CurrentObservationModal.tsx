import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { CurrentObservation } from "./CurrentObservation"
import { cn } from "./cn"
import { Dialog, DialogContent } from "./shadcn/ui/dialog"

export const CurrentObservationModal = NiceModal.create<{
  wildlifeId: string
}>(({ wildlifeId }) => {
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
          "fixed bottom-0 right-0 z-50 flex w-full max-w-md flex-col gap-4 rounded-t-xl bg-white p-4 text-black shadow md:bottom-8 md:right-8 md:rounded-xl",
          "left-auto top-auto translate-x-0 translate-y-0 border-0"
        )}
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)",
        }}
        // onPointerDownOutside={(e) => e.preventDefault()}
        // onInteractOutside={(e) => e.preventDefault()}
      >
        {/* <ScrollArea className="max-h-[calc(100svh-100px)] h-96"> */}
        <CurrentObservation wildlifeId={wildlifeId} />
        {/* </ScrollArea> */}
      </DialogContent>
    </Dialog>
  )
})

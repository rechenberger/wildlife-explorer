import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { CurrentObservation } from "./CurrentObservation"
import { cn } from "./cn"
import { Dialog } from "./shadcn/ui/dialog"

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
      <div
        className={cn(
          "fixed bottom-0 right-0 z-50 flex w-full max-w-md flex-col gap-4 rounded-t-xl bg-white p-4 text-black shadow md:bottom-8 md:right-8 md:rounded-xl"
        )}
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)",
        }}
      >
        {/* <ScrollArea className="max-h-[calc(100svh-100px)] h-96"> */}
        <CurrentObservation wildlifeId={wildlifeId} />
        {/* </ScrollArea> */}
      </div>
    </Dialog>
  )
})
